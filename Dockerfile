ARG BASE_IMAGE=itkwasm/emscripten
ARG BASE_TAG=20230214-4d22c050

FROM $BASE_IMAGE:$BASE_TAG
ARG BASE_IMAGE
ARG CMAKE_BUILD_TYPE=Release

WORKDIR /

ENV VTK_GIT_TAG f2c452c9c42005672a3f3ed9218dd9a7fecca79a
RUN git clone https://github.com/Kitware/VTK.git && \
  cd VTK && \
  git checkout ${VTK_GIT_TAG} && \
  cd ../ && \
  mkdir VTK-build && \
  cd VTK-build && \
  cmake \
    -G Ninja \
    -DCMAKE_BUILD_TYPE:STRING=Release \
    -DBUILD_SHARED_LIBS:BOOL=OFF \
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE_DOCKCROSS} \
    -DCMAKE_INSTALL_PREFIX:PATH=/install-prefix \
    -DVTK_ENABLE_LOGGING:BOOL=OFF \
    -DVTK_ENABLE_WRAPPING:BOOL=OFF \
    -DVTK_ENABLE_KITS:BOOL=OFF \
    -DVTK_GROUP_ENABLE_MPI=NO \
    -DVTK_GROUP_ENABLE_Qt=NO \
    -DVTK_GROUP_ENABLE_Rendering=WANT \
    -DVTK_GROUP_ENABLE_StandAlone=WANT \
    -DVTK_GROUP_ENABLE_Views=NO \
    -DVTK_GROUP_ENABLE_Web=NO \
    -DVTK_MODULE_ENABLE_VTK_InteractionStyle=WANT \
    -DVTK_MODULE_ENABLE_VTK_InteractionWidgets=WANT \
    -DVTK_MODULE_ENABLE_VTK_RenderingContext2D=DONT_WANT \
    -DVTK_MODULE_ENABLE_VTK_RenderingContextOpenGL2=DONT_WANT \
    -DVTK_MODULE_ENABLE_VTK_RenderingLICOpenGL2=DONT_WANT \
    -DVTK_LEGACY_REMOVE:BOOL=ON \
    -DVTK_OPENGL_USE_GLES:BOOL=ON \
    -DVTK_USE_SDL2:BOOL=ON \
    -DOPENGL_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_EGL_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_GLES2_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_GLES3_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DVTK_NO_PLATFORM_SOCKETS:BOOL=ON \
    -DBUILD_TESTING:BOOL=OFF \
    -DVTK_IGNORE_CMAKE_CXX11_CHECKS:BOOL=ON \
    -DVTK_MODULE_ENABLE_VTK_FiltersGeometry:STRING=YES \
    -DVTK_MODULE_ENABLE_VTK_hdf5:STRING=NO \
    -DVTK_MODULE_ENABLE_VTK_libproj:STRING=NO \
    -DH5_HAVE_GETPWUID:BOOL=OFF \
    ../VTK && \
  ninja && \
    find . -name '*.o' -delete && \
    cd .. && chmod -R 777 VTK-build

ENV ITKVtkGlue_GIT_TAG 1650862cf82531b0a251066454e80053996311f2
RUN git clone https://github.com/InsightSoftwareConsortium/ITKVTKGlue.git ITKVtkGlue && \
  cd ITKVtkGlue && \
  git checkout ${ITKVtkGlue_GIT_TAG} && \
  cd ../ && \
  mkdir ITKVtkGlue-build && \
  cd ITKVtkGlue-build && \
  cmake \
    -G Ninja \
    -DCMAKE_BUILD_TYPE:STRING=$CMAKE_BUILD_TYPE \
    -DBUILD_SHARED_LIBS:BOOL=OFF \
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE_DOCKCROSS} \
    -DCMAKE_INSTALL_PREFIX:PATH=/install-prefix \
    -DBUILD_TESTING:BOOL=OFF \
    -DITK_DIR:PATH=/ITK-build \
    -DVTK_DIR:PATH=/VTK-build \
    -DOPENGL_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_EGL_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_GLES2_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    -DOPENGL_GLES3_INCLUDE_DIR:PATH=/emsdk/upstream/emscripten/system/include/ \
    ../ITKVtkGlue && \
  ninja && \
  find . -name '*.o' -delete && \
  cd .. && chmod -R 777 ITK-build

RUN chmod -R 777 /emsdk/upstream/emscripten/cache

# Build-time metadata as defined at http://label-schema.org
ARG BUILD_DATE
ARG IMAGE=plus/emscripten-vtk
ARG VERSION=latest
ARG VCS_REF
ARG VCS_URL
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name=$IMAGE \
      org.label-schema.version=$VERSION \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url=$VCS_URL \
      org.label-schema.schema-version="1.0"
ENV DEFAULT_DOCKCROSS_IMAGE ${IMAGE}:${VERSION}
WORKDIR /work
