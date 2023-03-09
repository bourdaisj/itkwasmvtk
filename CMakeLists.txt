cmake_minimum_required(VERSION 3.16)
project(ItkWasmVtk)
set(CMAKE_CXX_STANDARD 17)

add_subdirectory(pipelines/convertToPolyData)
add_subdirectory(pipelines/convertEnsightToPolyData)
add_subdirectory(pipelines/convertUGToPolyData)
