// Data buku akan disimpan dalam array
let books = JSON.parse(localStorage.getItem("books")) || [];
let editedBookId = null; // Untuk menyimpan ID buku yang sedang diedit

// Elemen DOM
const bookForm = document.getElementById("bookForm");
const bookFormTitle = document.getElementById("bookFormTitle");
const bookFormAuthor = document.getElementById("bookFormAuthor");
const bookFormYear = document.getElementById("bookFormYear");
const bookFormIsComplete = document.getElementById("bookFormIsComplete");
const bookFormSubmit = document.getElementById("bookFormSubmit");
const notification = document.getElementById("notification");
const incompleteBookList = document.getElementById("incompleteBookList");
const completeBookList = document.getElementById("completeBookList");
const incompleteBookCount = document.getElementById("incompleteBookCount");
const completeBookCount = document.getElementById("completeBookCount");
const searchBook = document.getElementById("searchBook");
const searchBookTitle = document.getElementById("searchBookTitle");

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Fungsi untuk menyimpan data buku ke localStorage
function saveToLocalStorage() {
  localStorage.setItem("books", JSON.stringify(books));
}

// Fungsi untuk memperbarui jumlah buku
function updateBookCount() {
  const incompleteCount = books.filter((book) => !book.isComplete).length;
  const completeCount = books.filter((book) => book.isComplete).length;
  incompleteBookCount.textContent = `Jumlah Buku: ${incompleteCount}`;
  completeBookCount.textContent = `Jumlah Buku: ${completeCount}`;
}

// Fungsi untuk membuat elemen buku
function createBookElement(book) {
  const bookElement = document.createElement("div");
  bookElement.dataset.bookid = book.id;
  bookElement.dataset.testid = "bookItem";

  const titleElement = document.createElement("h3");
  titleElement.dataset.testid = "bookItemTitle";
  titleElement.textContent = book.title;

  const authorElement = document.createElement("p");
  authorElement.dataset.testid = "bookItemAuthor";
  authorElement.textContent = `Penulis: ${book.author}`;

  const yearElement = document.createElement("p");
  yearElement.dataset.testid = "bookItemYear";
  yearElement.textContent = `Tahun: ${book.year}`;

  const buttonContainer = document.createElement("div");

  const toggleCompleteButton = document.createElement("button");
  toggleCompleteButton.dataset.testid = "bookItemIsCompleteButton";
  toggleCompleteButton.textContent = book.isComplete ? "Belum selesai" : "Selesai dibaca";
  toggleCompleteButton.addEventListener("click", () => toggleBookComplete(book.id));

  const deleteButton = document.createElement("button");
  deleteButton.dataset.testid = "bookItemDeleteButton";
  deleteButton.textContent = "Hapus Buku";
  deleteButton.addEventListener("click", () => deleteBook(book.id));

  const editButton = document.createElement("button");
  editButton.dataset.testid = "bookItemEditButton";
  editButton.textContent = "Edit Buku";
  editButton.addEventListener("click", () => loadBookForEdit(book.id));

  buttonContainer.append(toggleCompleteButton, deleteButton, editButton);
  bookElement.append(titleElement, authorElement, yearElement, buttonContainer);
  return bookElement;
}

// Fungsi untuk merender ulang daftar buku
function renderBooks() {
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books.forEach((book) => {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  });

  updateBookCount();
}

// Fungsi untuk menambahkan atau menyimpan buku
function saveBook(event) {
  event.preventDefault();

  const title = bookFormTitle.value.trim();
  const author = bookFormAuthor.value.trim();
  const year = parseInt(bookFormYear.value.trim(), 10); // Konversi ke number
  const isComplete = bookFormIsComplete.checked;

  if (!title || !author || isNaN(year) || year <= 0) { 
    showNotification("Mohon isi semua data buku dengan benar!");
    return;
  }
  

  if (editedBookId) {
    // Edit buku
    const book = books.find((b) => b.id === editedBookId);
    if (book) {
      book.title = title;
      book.author = author;
      book.year = year; // Tetap sebagai number
      book.isComplete = isComplete;
    }
    showNotification("Buku berhasil diperbarui!");
    editedBookId = null;
    bookFormSubmit.textContent = "Masukkan Buku ke rak Belum selesai dibaca";
  } else {
    // Tambah buku
    const newBook = {
      id: +new Date(),
      title,
      author,
      year, // Tetap sebagai number
      isComplete,
    };
    books.push(newBook);
    showNotification("Buku berhasil ditambahkan!");
  }

  saveToLocalStorage();
  bookForm.reset();
  renderBooks();
}


// Fungsi untuk memuat data buku ke form untuk diedit
function loadBookForEdit(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    editedBookId = book.id;
    bookFormTitle.value = book.title;
    bookFormAuthor.value = book.author;
    bookFormYear.value = book.year;
    bookFormIsComplete.checked = book.isComplete;
    bookFormSubmit.textContent = "Perbarui Buku";
  }
}

// Fungsi untuk menghapus buku
function deleteBook(bookId) {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Buku yang dihapus tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Hapus buku dengan ID:", bookId);

      if (!books.find((book) => book.id === bookId)) {
        console.error("Book ID tidak ditemukan:", bookId);
        return;
      }

      books = books.filter((book) => book.id !== bookId);
      console.log("Books setelah penghapusan:", books);

      saveToLocalStorage(); // Simpan ke localStorage
      renderBooks(); // Render ulang daftar buku

      Swal.fire({
        title: "Dihapus!",
        text: "Buku berhasil dihapus.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
}



// Fungsi untuk mengubah status buku
function toggleBookComplete(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    saveToLocalStorage();
    renderBooks();
  }
}

// Fungsi untuk mencari buku
function searchBooks(event) {
  event.preventDefault();

  const query = searchBookTitle.value.trim().toLowerCase();
  if (query) {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(query)
    );

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    filteredBooks.forEach((book) => {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    });
  } else {
    renderBooks();
  }
}

// Event Listeners
bookForm.addEventListener("submit", saveBook);
searchBook.addEventListener("submit", searchBooks);

// Render awal
renderBooks();
