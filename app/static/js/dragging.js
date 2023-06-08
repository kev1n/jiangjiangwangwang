const files = document.querySelectorAll('.file');
const folders = document.querySelectorAll('.folder');

files.forEach(file => {
  file.addEventListener('dragstart', dragStart);
  file.addEventListener('dragend', dragEnd);
});

folders.forEach(folder => {
  folder.addEventListener('dragstart', dragStart);
  folder.addEventListener('dragend', dragEnd);
  folder.addEventListener('dragover', dragOver);
  folder.addEventListener('dragenter', dragEnter);
  folder.addEventListener('dragleave', dragLeave);
  folder.addEventListener('drop', drop);
});

let draggedFile = null;

function dragStart(event) {
  // Store the dragged file's reference
  draggedFile = event.target;
  // Set the dragged data with a custom MIME type
  console.log(event.target)
  if (event.target.classList.contains('file')) {
    event.dataTransfer.setData('text/plain', 'file');
  } else if (event.target.classList.contains('folder')) {
    event.dataTransfer.setData('text/plain', 'folder');
  }

  // Add a CSS class for visual feedback (e.g., changing opacity)
  event.target.classList.add('dragging');
}

function dragEnd(event) {
  // Remove the CSS class added during dragStart
  event.target.classList.remove('dragging');
}

function dragOver(event) {
    event.preventDefault();
  }
  
function dragEnter(event) {
    event.preventDefault();
    // Add a CSS class to the folder for visual feedback
    event.target.classList.add('dragover');
}

function dragLeave(event) {
    // Remove the CSS class added during dragEnter
    event.target.classList.remove('dragover');
}

function drop(event) {
    event.preventDefault();

    //we implement this fix because sometimes the event.target is not the folder element, but rather one of its children
    folderElement = event.target;
    while (!folderElement.hasAttribute('foldername')) {
      folderElement = folderElement.parentElement;
    }

    // Remove the CSS class added during dragEnter
    event.target.classList.remove('dragover');
    console.log(event.dataTransfer.getData('text/plain'))
    // Check if the dragged item is a file
    if (event.dataTransfer.getData('text/plain') === 'file') {

        const filename = draggedFile.getAttribute('filename');
        console.log(folderElement)
        const foldername = folderElement.getAttribute('foldername');
        // add file to new folder
        moveFileToFolder(filename, foldername);

        // delete file from existance
        draggedFile.remove();
    } else if (event.dataTransfer.getData('text/plain') === 'folder') {

        const fromfoldername = draggedFile.getAttribute('foldername');
        const toFoldername = folderElement.getAttribute('foldername');
        // add folder to new folder
        moveFileToFolder(fromfoldername, toFoldername);

        // delete folder from existance
        draggedFile.remove();
    }
}