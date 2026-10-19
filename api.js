const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let notes = [];

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

function setEmptyState() {
  notesList.replaceChildren();

  const item = document.createElement("li");
  item.className = "empty-state";
  item.textContent = "No notes to display. Load notes or create one.";

  notesList.appendChild(item);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return { data, status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    setEmptyState();
    return;
  }

  for (const note of notes) {
    const item = document.createElement("li");
    item.className = "note";

    const heading = document.createElement("h3");
    heading.textContent = note.title || "(Untitled note)";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const id = document.createElement("p");
    id.className = "note-id";
    id.textContent = `Note ID: ${note.id}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id, deleteButton);
    });

    item.append(heading, body, id, deleteButton);
    notesList.appendChild(item);
  }
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = Array.isArray(result.data) ? result.data : [];

    renderNotes();

    if (notes.length === 0) {
      setStatus("The server returned no notes.", "success");
    } else {
      setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    setStatus(`Could not load notes. ${error.message}`, "error");
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    const createdNote = result.data;

    if (!createdNote || createdNote.id === undefined) {
      throw new Error("The server response did not contain a note ID.");
    }

    // JSONPlaceholder simulates creation; it does not permanently save the note.
    notes = [createdNote, ...notes];
    renderNotes();
    noteForm.reset();

    setStatus(
      `Note created (status ${result.status}, id ${createdNote.id}).`,
      "success"
    );
  } catch (error) {
    setStatus(`Could not create note. ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  setStatus(`Deleting note ${id}...`);

  let succeeded = false;

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion; it does not permanently delete data.
    notes = notes.filter(note => String(note.id) !== String(id));
    renderNotes();
    setStatus(`Note ${id} removed from this view.`, "success");
    succeeded = true;
  } catch (error) {
    setStatus(`Could not delete note. ${error.message}`, "error");
  } finally {
    if (!succeeded) {
      button.disabled = false;
    }
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
