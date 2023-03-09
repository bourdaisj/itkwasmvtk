#include "itkPipeline.h"
#include "itkWasmPolyData.h"

#include "vtkArchiver.h"
#include "vtkClipDataSet.h"
#include "vtkGeometryFilter.h"
#include "vtkJSONDataSetWriter.h"
#include "vtkPolyDataReader.h"
#include "vtkSmartPointer.h"
#include "vtkXMLPolyDataWriter.h"
#include "vtkXMLUnstructuredGridReader.h"
#include "vtkXMLReader.h"
#include "vtkPlane.h"

int main(int argc, char* argv[]) {
  itk::wasm::Pipeline pipeline("convert-ug-to-polydata", "convert ug to polydata", argc, argv);

  std::string inputBinaryFile;
  std::string outputBinaryFile;
  pipeline.add_option("input-binary-file", inputBinaryFile, "The input binary file")->required()->type_name("INPUT_BINARY_FILE");
  pipeline.add_option("output-binary-file", outputBinaryFile, "The output binary file")->required()->type_name("OUTPUT_BINARY_FILE");

  ITK_WASM_PARSE(pipeline);

  vtkSmartPointer<vtkXMLReader> ugReader = vtkSmartPointer<vtkXMLUnstructuredGridReader>::New();

  if (!ugReader->CanReadFile(inputBinaryFile.c_str())) {
    std::cerr << "Unsupported file." << std::endl;
    return EXIT_FAILURE;
  }

  ugReader->SetFileName(inputBinaryFile.c_str());
  ugReader->Update();
  vtkNew<vtkGeometryFilter> geometryFilter;
  geometryFilter->SetInputConnection(ugReader->GetOutputPort());
  geometryFilter->Update();

  vtkNew<vtkXMLPolyDataWriter> writer;
  writer->SetEncodeAppendedData(false); // VTK.js sometimes fails to read base 64 encoded appended data ...
  writer->SetCompressorTypeToNone(); // VTK.js sometimes fails if compression is on
  writer->SetInputConnection(geometryFilter->GetOutputPort());
  writer->SetFileName(outputBinaryFile.c_str());

  try {
    std::cout << "updating writer" << std::endl;
    writer->Update();
    std::cout << outputBinaryFile << std::endl;
  } catch (const std::exception& error) {
    std::cout << "failed processing." << std::endl;
    std::cerr << "Error: " << error.what() << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
