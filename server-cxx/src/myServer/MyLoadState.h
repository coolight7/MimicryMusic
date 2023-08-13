#ifndef MIMICRY_LOADSTATE_H
#define MIMICRY_LOADSTATE_H

#include "MyLimit.h"
#include "MyHttpTask.h"

enum MyLoadState_e {
	Low,
	Middle,
	Height,
	Heavy,
};

/// <summary>
/// 负载管理
/// </summary>
class MyLoadController_c {
protected:
	std::shared_ptr<mimicry::MyTimer_c> timer = nullptr;

public:
	bool enableAutoFlushState = false;
	/// 当前负载状态
	MyLoadState_e state = MyLoadState_e::Low;

	static int loadStateToInt(MyLoadState_e state) {
		return state;
	}

	static MyLoadState_e computeCpuState(double percent) {
		// 0             40            65           85
		//      low            middle        height       heavy
		if(percent >= 85) {
			return MyLoadState_e::Heavy;
		} else if(percent >= 65) {
			return MyLoadState_e::Height;
		} else if(percent >= 40) {
			return MyLoadState_e::Middle;
		} else {
			return  MyLoadState_e::Low;
		}
	}

	static MyLoadState_e computeMemoryState(double percent) {
		// 0             55            75           90
		//      low            middle        height       heavy
		if(percent >= 90) {
			return MyLoadState_e::Heavy;
		} else if(percent >= 75) {
			return MyLoadState_e::Height;
		} else if(percent >= 55) {
			return MyLoadState_e::Middle;
		} else {
			return  MyLoadState_e::Low;
		}
	}

	static MyLoadState_e computeNetworkState(double percent) {
		// 0             50            70           85
		//      low            middle        height       heavy
		if(percent >= 85) {
			return MyLoadState_e::Heavy;
		} else if(percent >= 70) {
			return MyLoadState_e::Height;
		} else if(percent >= 50) {
			return MyLoadState_e::Middle;
		} else {
			return  MyLoadState_e::Low;
		}
	}

	/// 综合统计结果
	static MyLoadState_e computeStatisticState(MyLoadState_e cpuState, 
		MyLoadState_e memoryState, 
		MyLoadState_e networkState) {
		// 7
		const double maxSum = MyLoadController_c::loadStateToInt(MyLoadState_e::Heavy) * 4.5;
		double sum = MyLoadController_c::loadStateToInt(cpuState) * 2 
			+ MyLoadController_c::loadStateToInt(memoryState) * 1 
			+ MyLoadController_c::loadStateToInt(networkState) * 1.5;
		if(sum > maxSum * 0.85)  {
			return MyLoadState_e::Heavy;
		} else if(sum > maxSum * 0.65) {
			return MyLoadState_e::Height;
		} else if(sum > maxSum * 0.4) {
			return MyLoadState_e::Middle;
		} else {
			return MyLoadState_e::Low;
		}
	}

	/* * 当前负载状态是否 <= [in_state]
	* 
	*/
	bool isAllow(const MyLoadState_e in_state) {
		return (state <= in_state);
	}

	template<typename T>
	T& switchValue(T& yValue, T& nValue, 
		const MyLoadState_e in_state = MyLoadState_e::Middle) {
		if (isAllow(in_state)) {
			return yValue;
		}
		else {
			return nValue;
		}
	}

	template<typename T = void>
	T switchDo(const std::function<T()>& yFun, 
		const std::function<T()>& nFun, 
		const MyLoadState_e in_state = MyLoadState_e::Middle) {
		if (isAllow(in_state)) {
			return yFun();
		}
		else {
			return nFun();
		}
	}

	void initAutoFlushState();

	void setState(MyLoadState_e in_state) {
		state = in_state;
	}

	void defRefuseConnect(MyHttpTask_c* in_http_task);
};

#endif