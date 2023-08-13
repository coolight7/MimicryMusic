#include "MyLoadState.h"
#include "workflow/WFHttpServer.h"
#include "MyLog.h"

#ifdef _WIN32
	#include <pdh.h>
	#include <pdhmsg.h>
	#include <IPHlpApi.h>
	#pragma comment(lib, "pdh.lib")
	#pragma comment(lib, "IPHlpApi.lib")
#else
    #include <sys/sysinfo.h>
    #include <stdio.h>
#endif

typedef struct _CPU_PACKED
{
  char name[16];
  unsigned int user;   //用户模式
  unsigned int nice;   //低优先级的用户模式
  unsigned int system; //内核模式
  unsigned int idle;   //空闲处理器时间
} CPU_OCCUPY;

/*收发数据包结构体*/
typedef struct _RTX_BYTES
{
    long int tx_bytes;
    long int rx_bytes;
    struct timeval rtx_time;
} RTX_BYTES;

#ifndef _WIN32
// linux
void getCurrentDownloadRates(long int* save_rate)
{
    // TODO: 这是网络接口名，根据主机配置
    char intface[] = "eth0:";
    FILE* net_dev_file;
    char buffer[1024];
    if ((net_dev_file = fopen("/proc/net/dev", "r")) == NULL) {
        MyLog_c::getInstance()->cferror("open file /proc/net/dev/ error!");
    }

    int i = 0;
    while (i++ < 20) {
        if (fgets(buffer, sizeof(buffer), net_dev_file) != NULL) {
            if (strstr(buffer, intface) != NULL) {
                sscanf(buffer, "%s %ld", buffer, save_rate);
                break;
            }
        }
    }
    if (i == 20) *save_rate = 0.01;
    fclose(net_dev_file); //关闭文件
    return;
}
#endif

void MyLoadController_c::initAutoFlushState() {
    MyLog_c::getInstance()->cfinfo("MyLoadController_c::initAutoFlushState()");
    auto interval = std::chrono::seconds(60);
#ifdef _WIN32
    // windows --- 
    // 定义一个PDH查询句柄
    auto hQuery = std::make_shared<PDH_HQUERY>();
    // 定义一个PDH计数器句柄
    auto cpuCounter = std::make_shared<PDH_HCOUNTER>();
    // 初始化PDH查询
    auto status = PdhOpenQuery(NULL, 0, hQuery.get());
    if(status == ERROR_SUCCESS) {
        status = PdhAddEnglishCounter(*hQuery, "\\Processor(_Total)\\% Processor Time", 0, cpuCounter.get());
        MyLog_c::getInstance()->cfinfo("add cpu counter status= " + std::to_string(status == ERROR_SUCCESS));
        // 收集查询数据
        PdhCollectQueryData(*hQuery);
        // 每1分钟刷新一次负载状态
        timer = mimicry::MyTimer_c::cLoop(
            interval,
            [this, hQuery, cpuCounter]() {
                if(false == enableAutoFlushState) {
                    return;
                }
                MyLog_c::getInstance()->cfinfo(" -- [load state] -- ");
                auto cpuState = MyLoadState_e::Low;
                auto memoryState = MyLoadState_e::Low;
                // 收集查询数据
                PdhCollectQueryData(*hQuery);

                // 定义一个PDH格式化值结构体
                PDH_FMT_COUNTERVALUE fmtValue;

                // 获取计数器的格式化值
                auto status = PdhGetFormattedCounterValue(*cpuCounter, PDH_FMT_DOUBLE, NULL, &fmtValue);
                if(status != ERROR_SUCCESS) {
                    MyLog_c::getInstance()->cferror("CPU: Get Error= " + std::to_string(status));
                } else {
                    cpuState = MyLoadController_c::computeCpuState(fmtValue.doubleValue);
                    MyLog_c::getInstance()->cfinfo("CPU: " + std::to_string(fmtValue.doubleValue) + "%");
                }

                MEMORYSTATUS ms;  
                ::GlobalMemoryStatus(&ms);  
                memoryState = MyLoadController_c::computeCpuState(ms.dwMemoryLoad);
                MyLog_c::getInstance()->cfinfo("memory: " + std::to_string(ms.dwMemoryLoad) + "%");
                // 汇总
                auto state = MyLoadController_c::computeStatisticState(cpuState, memoryState, MyLoadState_e::Middle);
                this->setState(state);
                switch(state) {
                    case MyLoadState_e::Low:
                        MyLog_c::getInstance()->cfinfo("load state: low");
                        break;
                    case MyLoadState_e::Middle:
                        MyLog_c::getInstance()->cfinfo("load state: middle");
                        break;
                    case MyLoadState_e::Height:
                        MyLog_c::getInstance()->cfwarn("load state: height");
                        break;
                    case MyLoadState_e::Heavy:
                        MyLog_c::getInstance()->cfwarn("load state: heavy");
                        break;
                }
        });
    }
#else
    // linux ---
    timer = mimicry::MyTimer_c::cLoop(
        interval,
        [this]() {
            if(false == enableAutoFlushState) {
                return;
            }
            auto cpuState = MyLoadState_e::Low;
            auto memoryState = MyLoadState_e::Low;
            auto networkState = MyLoadState_e::Low;
            // cpu
            auto fd = fopen("/proc/stat", "r");
            if (fd == NULL) {
                MyLog_c::getInstance()->cferror("CPU: Get Error");
            }
            else {
                auto cpu = CPU_OCCUPY{};
                char buff[1024] = {};
                if(fgets(buff, sizeof(buff), fd) != nullptr) {
                    sscanf(buff, "%s %u %u %u %u", cpu.name, &cpu.user, &cpu.nice, &cpu.system, &cpu.idle);
                    fclose(fd);
                    double percent = (cpu.user + cpu.nice + cpu.system) / (cpu.user + cpu.nice + cpu.system + cpu.idle);
                    cpuState = MyLoadController_c::computeCpuState(percent);
                    MyLog_c::getInstance()->cfinfo("CPU: " + std::to_string(percent) + "%");
                }
            }
            // memory
            int ret = 0;
            struct sysinfo info;
            ret = sysinfo(&info);
            if (ret != 0) {
                MyLog_c::getInstance()->cferror("Memory: Get Error");
            }
            else {
                double percent = (info.totalram - info.freeram) / info.totalram;
                memoryState = MyLoadController_c::computeMemoryState(percent);
                MyLog_c::getInstance()->cfinfo("Memory: " + std::to_string(percent) + "%");
            }
            // network
            long download_rates = 0;
            getCurrentDownloadRates(&download_rates);
            // TODO: 由于目前使用的服务器带宽是 5 M，因此这里设定如此
            double percent = download_rates / (1024 * 1024 * 5 / 8);
            networkState = MyLoadController_c::computeNetworkState(percent);
            MyLog_c::getInstance()->cfinfo("Network: " + std::to_string(percent) + "%");
            // 汇总
            auto state = MyLoadController_c::computeStatisticState(cpuState, memoryState, networkState);
            this->setState(state);
            switch (state) {
            case MyLoadState_e::Low:
                MyLog_c::getInstance()->cfinfo("load state: low");
                break;
            case MyLoadState_e::Middle:
                MyLog_c::getInstance()->cfinfo("load state: middle");
                break;
            case MyLoadState_e::Height:
                MyLog_c::getInstance()->cfwarn("load state: height");
                break;
            case MyLoadState_e::Heavy:
                MyLog_c::getInstance()->cfwarn("load state: heavy");
                break;
            }
        });
#endif
}

void MyLoadController_c::defRefuseConnect(MyHttpTask_c* in_http_task) {
    this->switchDo<void>([in_http_task]() {
            in_http_task->get_resp()->out_err(mimicry::ResponeState_e::Forbidden);
            // 关闭连接
            in_http_task->get_resp()->add_header_pair("Connection", "close");
        }, [in_http_task]() {
            // 直接打断
            in_http_task->noreply();
        }
    );
}