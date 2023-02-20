#include "vtkArchiver.h"
#include "vtkGeometryFilter.h"
#include "vtkJSONDataSetWriter.h"
#include "vtkPolyDataReader.h"
#include "vtkSmartPointer.h"
#include "vtkXMLPolyDataReader.h"
#include "vtkXMLReader.h"

int main(int argc, char* argv[]) {
  std::cout << "Start processing." << std::endl;

  if (argc < 3) {
    std::cerr << "Usage: " << argv[0] << " <inputFile> <outputPolyDataFile> "
              << std::endl;
    return EXIT_FAILURE;
  }
  const char* inputFile = argv[1];
  const char* outputPolyDataFile = argv[2];

  vtkNew<vtkGeometryFilter> geometryFilter;

  vtkNew<vtkArchiver> archiver;
  archiver->SetArchiveName(outputPolyDataFile);
  vtkNew<vtkJSONDataSetWriter> writer;
  writer->SetArchiver(archiver);

  bool canReadFile = false;

  vtkSmartPointer<vtkXMLReader> reader =
      vtkSmartPointer<vtkXMLPolyDataReader>::New();
  if (reader->CanReadFile(inputFile)) {
    canReadFile = true;
    reader->SetFileName(inputFile);
    writer->SetInputConnection(reader->GetOutputPort());
  }

  if (!canReadFile) {
    std::cerr << "Unsupported file." << std::endl;
    return EXIT_FAILURE;
  }

  try {
    writer->Update();
  } catch (const std::exception& error) {
    std::cout << "failed processing." << std::endl;
    std::cerr << "Error: " << error.what() << std::endl;
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
