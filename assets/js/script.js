const bookShelf = [];
const renderBook = "render-book";
const renderFilterBook = "filtered-book";

window.addEventListener("DOMContentLoaded", function () {
  const editModal = document.getElementById("editModal");
  const deleteModal = document.getElementById("deleteModal");

  const searchForm = document.getElementById("formSearchBook");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const valueSearch = document.getElementById("search").value.toLowerCase();
    searchBooks(valueSearch);
  });

  const submitForm = document.getElementById("formBook");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    submitBook();
  });

  function generateId() {
    return +new Date();
  }

  function submitBook() {
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const year = Number(document.getElementById("year").value);
    const isCompleted = document.getElementById("read").checked;

    if (typeof title !== "string" || title === "")
      return alert("Judul tidak boleh kosong");
    if (typeof author !== "string" || author === "")
      return alert("Penulis tidak boleh kosong");
    if (typeof year !== "number" || year === 0)
      return alert("Tahun tidak boleh kosong dan hanya boleh diisi angka");
    if (typeof isCompleted !== "boolean") return;

    const book = {
      id: generateId(),
      title,
      author,
      year,
      isCompleted,
    };

    bookShelf.unshift(book);
    renderBooks(bookShelf);
    saveData();
  }

  document.addEventListener(renderBook, function () {
    renderBooks(bookShelf);
  });

  function renderBooks(books) {
    const tbodyRead = document.getElementById("tbody-read");
    const tbodyUnread = document.getElementById("tbody-unread");

    tbodyRead.innerHTML = "";
    tbodyUnread.innerHTML = "";

    for (const book of books) {
      const bookElement = addBook(book);
      if (!book.isCompleted) tbodyUnread.innerHTML += bookElement;
      else tbodyRead.innerHTML += bookElement;
    }

    addActionEventBtn();
  }

  function searchBooks(valueInput) {
    const filteredBooks = bookShelf.filter((book) => {
      const title = book.title.toLowerCase();

      for (const char of valueInput) {
        if (title.indexOf(char) === -1) {
          return false;
        }
      }

      return true;
    });

    // Membuat event baru untuk merender buku yang difilter
    document.dispatchEvent(
      new CustomEvent(renderFilterBook, { detail: filteredBooks })
    );
  }

  document.addEventListener(renderFilterBook, function (event) {
    const filteredBooks = event.detail;
    renderBooks(filteredBooks);
  });

  function addBook(bookObject) {
    if (!bookObject.isCompleted) {
      return `<tr>
                <td>${bookObject.title}</td>
                <td>${bookObject.author}</td>
                <td>${bookObject.year}</td>
                <td>
                  <button class="btn btn-check" data-id="${bookObject.id}"><i class="fa-regular fa-circle-check fa-xl"></i></button>
                  <button class="btn btn-edit" data-id="${bookObject.id}"><i class="fa-solid fa-pen-to-square"></i>Ubah</button>
                  <button class="btn btn-delete" data-id="${bookObject.id}"><i class="fa-solid fa-trash-can"></i>Hapus</button>
                </td>
              </tr>
        `;
    } else {
      return `<tr>
                <td>${bookObject.title}</td>
                <td>${bookObject.author}</td>
                <td>${bookObject.year}</td>
                <td>
                  <button class="btn btn-undo" data-id="${bookObject.id}"><i class="fa-solid fa-rotate-left fa-xl"></i></button>
                  <button class="btn btn-edit" data-id="${bookObject.id}"><i class="fa-solid fa-pen-to-square"></i>Ubah</button>
                  <button class="btn btn-delete" data-id="${bookObject.id}"><i class="fa-solid fa-trash-can"></i>Hapus</button>
                </td>
              </tr>
              `;
    }
  }

  function addActionEventBtn() {
    const checkButton = document.querySelectorAll(".btn-check");
    const undoButton = document.querySelectorAll(".btn-undo");
    const deleteButton = document.querySelectorAll(".btn-delete");
    const editButton = document.querySelectorAll(".btn-edit");
    checkButton.forEach((btn) => {
      btn.addEventListener("click", function () {
        const bookId = Number(btn.getAttribute("data-id"));
        checkBook(bookId);
      });
    });

    undoButton.forEach((btn) => {
      btn.addEventListener("click", function () {
        const bookId = Number(btn.getAttribute("data-id"));
        undoBook(bookId);
      });
    });

    deleteButton.forEach((btn) => {
      btn.addEventListener("click", function () {
        const bookId = Number(btn.getAttribute("data-id"));
        deleteModal.style.display = "inline-block";
        const confirmBtn = document.getElementById("confirmDelete");
        const cancelBtn = document.getElementById("cancelDelete");
        const closeModal = document.getElementById("closeModalDelete");

        closeModal.addEventListener("click", function () {
          deleteModal.style.display = "none";
        });

        confirmBtn.addEventListener("click", function () {
          destroyBook(bookId);
          deleteModal.style.display = "none";
        });

        cancelBtn.addEventListener("click", function () {
          deleteModal.style.display = "none";
        });
      });
    });

    editButton.forEach((btn) => {
      btn.addEventListener("click", function () {
        const bookId = Number(btn.getAttribute("data-id"));
        const bookElement = editBook(bookId);
        editModal.innerHTML = bookElement;
        editModal.style.display = "inline-block";

        const btnClose = document.getElementById("closeModal");
        btnClose.addEventListener("click", function () {
          editModal.style.display = "none";
        });

        const formEdit = document.getElementById("formBookEdit");
        formEdit.addEventListener("submit", function (e) {
          e.preventDefault();
          const title = document.getElementById("titleEdit").value;
          const author = document.getElementById("authorEdit").value;
          const year = Number(document.getElementById("yearEdit").value);
          const isCompleted = document.getElementById("readEdit").checked;
          
          if (typeof title !== "string" || title === "") return alert("Judul tidak boleh kosong");
          if (typeof author !== "string" || author === "") return alert("Penulis tidak boleh kosong");
          if (typeof year !== "number" || year === 0) return alert("Tahun tidak boleh kosong dan hanya boleh diisi angka");
          if (typeof isCompleted !== "boolean") return;

          const objBookEdit = {
            id: bookId,
            title,
            author,
            year,
            isCompleted,
          };

          const bookindex = findBookIndex(bookId);

          bookShelf.splice(bookindex, 1, objBookEdit);
          renderBooks(bookShelf);
          editModal.style.display = "none";
          saveData();
        });
      });
    });
  }

  function editBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    return `
    <div class="modal-content">
      <button class="close" id="closeModal">&times;</button>
      <form action="#" id="formBookEdit">
        <div class="form-group">
          <label for="title" class="title">Title</label>
          <input type="text" class="input-text" id="titleEdit" value="${
            bookTarget.title
          }">
        </div>

        <div class="form-group">
          <label for="author" class="title">Penulis</label>
          <input type="text" class="input-text" id="authorEdit" value="${
            bookTarget.author
          }">
        </div>

        <div class="form-group">
          <label for="year" class="title">Tahun</label>
          <input type="number" class="input-number" id="yearEdit" value="${
            bookTarget.year
          }">
        </div>

        <div class="checkbox-container">
          <label for="read" class="title">Selesai Dibaca</label>
          <input type="checkbox" id="readEdit" ${
            bookTarget.isCompleted == true ? "checked" : ""
          }>
        </div>

        <div class="btn-container">
          <button type="submit" id="submitBook" class="btn btn-primary btn-submit-book">Ubah Buku</button>
        </div>
      </form>
    </div>
    `;
  }

  function checkBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = true;

    renderBooks(bookShelf);
    saveData();
  }

  function undoBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = false;

    renderBooks(bookShelf);
    saveData();
  }

  function findBook(bookId) {
    for (const bookItem of bookShelf) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function destroyBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    bookShelf.splice(bookTarget, 1);
    renderBooks(bookShelf);
    saveData();
  }

  function findBookIndex(bookId) {
    for (const index in bookShelf) {
      if (bookShelf[index].id === bookId) {
        return index;
      }
    }

    return -1;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(bookShelf);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }

  const SAVED_EVENT = "saved-book";
  const STORAGE_KEY = "BOOKSHELF_APPS";

  function isStorageExist() /* boolean */ {
    if (typeof Storage === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    const getBookItem = localStorage.getItem(STORAGE_KEY);
  });

  function loadDataFromStorage() {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);

    if (data !== null) {
      for (const book of data) {
        bookShelf.unshift(book);
      }
    }

    renderBooks(bookShelf);
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
