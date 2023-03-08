#include "itkPipeline.h"
#include "itkWasmPolyData.h"

#include "vtkArchiver.h"
#include "vtkClipDataSet.h"
#include "vtkGeometryFilter.h"
#include "vtkJSONDataSetWriter.h"
#include "vtkPolyDataReader.h"
#include "vtkSmartPointer.h"
#include "vtkXMLPolyDataReader.h"
#include "vtkXMLPolyDataWriter.h"
#include "vtkXMLReader.h"
#include "vtkPlane.h"


#include <vtkEnSightReader.h>
#include <vtkEnSightGoldBinaryReader.h>
#include <vtkMultiBlockDataSet.h>

int main(int argc, char* argv[]) {
  itk::wasm::Pipeline pipeline("convert-to-polydata", "convert to polydata", argc, argv);

  std::string inputBinaryFile;
  std::string outputBinaryFile;
  pipeline.add_option("input-binary-file", inputBinaryFile, "The input binary file")->required()->type_name("INPUT_BINARY_FILE");
  pipeline.add_option("output-binary-file", outputBinaryFile, "The output binary file")->required()->type_name("OUTPUT_BINARY_FILE");

  ITK_WASM_PARSE(pipeline);

  // Read all the data from the file
  vtkNew<vtkEnSightGoldBinaryReader> reader;

  if (!reader->CanReadFile(inputBinaryFile.c_str())) {
    std::cerr << "Unsupported file." << std::endl;
    return EXIT_FAILURE;
  }

  reader->SetCaseFileName(inputBinaryFile.c_str());
  reader->Update();

  auto outputData = reader->GetOutput();

  auto block1 = outputData->GetBlock(0);
  std::cout << block1->GetClassName() << std::endl;

  vtkNew<vtkGeometryFilter> geometryFilter;
  geometryFilter->SetInputData(block1);
  geometryFilter->Update();

  vtkNew<vtkXMLPolyDataWriter> writer;
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
