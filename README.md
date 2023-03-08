## Getting started
Two Dockerfiles are included in the project. They can be used to compiled C++ code to WASM modules.
You need to build them.
```bash
# build Dockerfile
docker build -f Dockerfile -t vtk-wasm/emscripten-vtk .
docker build -f Dockerfile.debug -t vtk-wasm/emscripten-vtk-debug .

# Building the project using itk-wasm CLI and the image we just built.
npx itk-wasm --image vtk-wasm/emscripten-vtk build -- -DVTK_DIR=/VTK-build -DCMAKE_CXX_FLAGS='-Os'
# Debugging
# npx itk-wasm --image vtk-wasm/emscripten-vtk-debug build -- -DVTK_DIR=/VTK-build -DCMAKE_CXX_FLAGS='-Os' -DCMAKE_BUILD_TYPE=Debug

# Start the project
npm run dev
```

## Resources
https://wasm.itk.org/tutorial/debugging
