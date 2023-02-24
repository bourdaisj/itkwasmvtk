## Getting started
```bash
# build Dockerfile
docker build -f Dockerfile -t plus/emscripten-vtk .
docker build -f Dockerfile.debug -t plus/emscripten-vtk-debug .
npx itk-wasm --image plus/emscripten-vtk build -- -DVTK_DIR=/VTK-build -DCMAKE_CXX_FLAGS='-Os'

# Debugging
npx itk-wasm --image plus/emscripten-vtk-debug build -- -DVTK_DIR=/VTK-build -DCMAKE_CXX_FLAGS='-Os' -DCMAKE_BUILD_TYPE=Debug
npm run dev
```

## Resources
https://wasm.itk.org/tutorial/debugging
