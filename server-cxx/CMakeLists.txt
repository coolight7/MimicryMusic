CMAKE_MINIMUM_REQUIRED(VERSION 3.6)
set(CMAKE_BUILD_TYPE RelWithDebInfo CACHE STRING "build type")

# set(CMAKE_TOOLCHAIN_FILE "${CMAKE_CURRENT_SOURCE_DIR}/vcpkg/scripts/buildsystems/vcpkg.cmake")

PROJECT(
	MimicryMusic
	LANGUAGES C CXX
)

add_compile_definitions(MyHttpServer_HOME="${PROJECT_SOURCE_DIR}/")
ADD_SUBDIRECTORY("src" "bin")