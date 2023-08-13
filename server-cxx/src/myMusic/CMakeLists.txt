CMAKE_MINIMUM_REQUIRED(VERSION 3.6)

aux_source_directory(. DIR_myMusic)
aux_source_directory(./test DIR_myMusic_test)

set(NAME_myMusic myMusic)

if (WIN32)
	# 是否替换使用/MT，建议不使用
	option(WORKFLOW_TUTORIAL_BUILD_STATIC_RUNTIME "Use static runtime" OFF)
	if (WORKFLOW_TUTORIAL_BUILD_STATIC_RUNTIME)
		set(CompilerFlags
				CMAKE_CXX_FLAGS
				CMAKE_CXX_FLAGS_DEBUG
				CMAKE_CXX_FLAGS_RELEASE
				CMAKE_CXX_FLAGS_MINSIZEREL
				CMAKE_C_FLAGS
				CMAKE_C_FLAGS_DEBUG
				CMAKE_C_FLAGS_RELEASE
				CMAKE_C_FLAGS_MINSIZEREL
				)
		foreach(CompilerFlag ${CompilerFlags})
			string(REPLACE "/MD" "/MT" ${CompilerFlag} "${${CompilerFlag}}")
		endforeach ()
	endif ()
endif ()

if (WIN32)
		# /wd4819 禁用msvc的4819[代码文件编码和当前系统环境不兼容]警告
		# 由于win中文系统默认为GB2312等非UTF-8编码，而项目整体代码都使用UTF-8，因此会有这个警告
		# 设置 /utf-8 即可解决
		set(CMAKE_C_FLAGS   "${CMAKE_C_FLAGS}   /utf-8 /wd4200")
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /utf-8 /wd4200 /Zc:__cplusplus /std:c++20")
else ()
		set(CMAKE_C_FLAGS   "${CMAKE_C_FLAGS}   -Wall -fPIC -pipe -std=gnu90")
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -fPIC -pipe -std=c++2a -fexceptions")
endif ()

find_path(JWT_CPP_INCLUDE_DIRS "jwt-cpp/base.h")

add_executable(${NAME_myMusic} 
	${DIR_myMusic} 
	${DIR_myMusic_test}
)
target_include_directories(${NAME_myMusic} PRIVATE
	${JWT_CPP_INCLUDE_DIRS}
)
target_link_libraries(${NAME_myMusic} 
	myServer
)
if (WIN32)
	target_compile_definitions(
		${NAME_myMusic} PRIVATE
		strdup=_strdup
		strcasecmp=_stricmp
		strncasecmp=_strnicmp
	)
endif ()
