"use strict";

const storageKey = "civic-profile-lab.saved-dashboard.v1";
const login = document.querySelector("#login");
const loginTitle = document.querySelector("#login-title");
const form = document.querySelector("#profile-form");
const intro = document.querySelector("#intro");
const dashboardPhoto = document.querySelector("#dashboard-photo");
const dashboard = document.querySelector("#dashboard");
const status = document.querySelector("#status");
const sample = document.querySelector("#sample");
const birthDate = form.elements.namedItem("birthDate");
const inputs = [...form.querySelectorAll("input[name]")];
const photoPreview = document.querySelector("#photo-preview");
const photoStatus = document.querySelector("#photo-status");
const save = document.querySelector("#save");

let previewUrl;
let demoValues;
let saved;

const sampleProfile = {
  firstName: "Mila",
  surname: "Przykład",
  birthDate: "1995-04-12",
  birthplace: "Gdańsk",
  country: "Poland",
  city: "Warsaw",
  address: "ul. Przykładowa 10",
  postalCode: "00-000",
};

function today() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("-");
}

function selectPhoto(event) {
  const picker = event.currentTarget;
  const file = picker.files[0];
  picker.value = "";
  if (!file) return;

  if (file.size > 20 * 1024 * 1024) {
    status.textContent = "Choose a photo under 20 MB.";
    return;
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  photoPreview.src = previewUrl;
  photoPreview.hidden = false;
  photoStatus.textContent = "Photo selected.";
  status.textContent = "";
}

photoPreview.addEventListener("error", () => {
  URL.revokeObjectURL(previewUrl);
  previewUrl = undefined;
  photoPreview.hidden = true;
  photoPreview.removeAttribute("src");
  photoStatus.textContent = "Choose another photo, such as a JPEG or PNG.";
});

async function encodePhoto() {
  await photoPreview.decode();
  const scale = Math.min(1, 512 / Math.max(photoPreview.naturalWidth, photoPreview.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(photoPreview.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(photoPreview.naturalHeight * scale));
  canvas.getContext("2d").drawImage(photoPreview, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

function renderDashboard(details) {
  if (!demoValues) {
    const numbers = crypto.getRandomValues(new Uint32Array(2));
    const pin = String(numbers[0] % 10000).padStart(4, "0");
    const suffix = numbers[1].toString(16).toUpperCase().padStart(8, "0");
    demoValues = { pin, reference: "DEMO-PL-" + suffix, license: "SAMPLE-DL-" + suffix };
  }

  const values = {
    ...details,
    ...demoValues,
    name: details.firstName + " " + details.surname,
    location: details.postalCode + " " + details.city + ", " + details.country,
  };
  for (const field of dashboard.querySelectorAll("[data-profile]")) {
    field.textContent = values[field.dataset.profile] ?? "";
  }
  for (const field of dashboard.querySelectorAll("[data-optional]")) {
    field.hidden = !values[field.dataset.optional];
  }
  dashboardPhoto.src = previewUrl;
}

function loadSavedProfile() {
  try {
    const entry = JSON.parse(localStorage.getItem(storageKey));
    if (entry?.profile?.version !== 1 || !entry.demo ||
        !inputs.every(({ name, required }) => !required || typeof entry.profile[name] === "string") ||
        typeof entry.profile.photo !== "string" || entry.profile.photo.length > 1024 * 1024) {
      return;
    }
    atob(entry.profile.photo);
    return entry;
  } catch {
    return;
  }
}

function showDashboard(profile) {
  renderDashboard(profile);
  login.hidden = true;
  form.hidden = true;
  intro.hidden = true;
  dashboard.hidden = false;
  document.querySelector("#dashboard-title").focus();
}

function showLogin() {
  login.reset();
  form.hidden = true;
  intro.hidden = true;
  dashboard.hidden = true;
  login.hidden = false;
  loginTitle.focus();
}

function restoreProfile() {
  const profile = saved.profile;
  for (const input of inputs) input.value = profile[input.name] ?? "";
  if (!previewUrl) {
    const bytes = Uint8Array.from(atob(profile.photo), (character) => character.charCodeAt(0));
    previewUrl = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    photoPreview.src = previewUrl;
    photoPreview.hidden = false;
    photoStatus.textContent = "Saved photo selected.";
  }
  demoValues = saved.demo;
  showDashboard(profile);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (save.disabled) return;

  birthDate.max = today();
  for (const input of inputs) input.value = input.value.trim();
  if (!form.reportValidity()) return;
  if (!previewUrl) {
    status.textContent = "Take a photo or choose one from your library.";
    document.querySelector("#camera").focus();
    return;
  }

  save.disabled = true;
  status.textContent = "";
  const details = Object.fromEntries(new FormData(form));
  try {
    const photo = await encodePhoto();
    const profile = { version: 1, ...details, photo };
    showDashboard(profile);
    saved = { profile, demo: demoValues };
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch {
      status.textContent = "This browser could not save the profile for your next visit.";
    }
  } catch {
    status.textContent = "The photo could not be processed. Choose another picture and try again.";
  } finally {
    save.disabled = false;
  }
});

document.querySelector("#back").addEventListener("click", () => {
  dashboard.hidden = true;
  dashboardPhoto.removeAttribute("src");
  intro.hidden = false;
  form.hidden = false;
  document.querySelector("#form-title").focus();
});

sample.addEventListener("click", () => {
  for (const input of inputs) input.value = sampleProfile[input.name] ?? "";
  status.textContent = "Sample details filled in. Add a photo to finish.";
  inputs[0].focus();
});

document.querySelector("#camera").addEventListener("change", selectPhoto);
document.querySelector("#photo").addEventListener("change", selectPhoto);
birthDate.max = today();
sample.hidden = false;
save.disabled = false;

login.addEventListener("submit", (event) => {
  event.preventDefault();
  login.reset();
  if (saved) restoreProfile();
});

document.querySelector("#lock").addEventListener("click", showLogin);

document.querySelector("#clear-profile").addEventListener("click", () => {
  if (!window.confirm("Remove this sample profile from this browser?")) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    status.textContent = "This browser could not remove the saved profile.";
    return;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  saved = demoValues = previewUrl = undefined;
  dashboardPhoto.removeAttribute("src");
  photoPreview.removeAttribute("src");
  photoPreview.hidden = true;
  photoStatus.textContent = "Choose one photo. The file stays on this device.";
  status.textContent = "Saved profile removed.";
  form.reset();
  login.hidden = true;
  intro.hidden = false;
  form.hidden = false;
  document.querySelector("#form-title").focus();
});

for (const button of document.querySelectorAll("[data-section]")) {
  button.addEventListener("click", () => {
    const section = document.getElementById(button.dataset.section);
    if (section instanceof HTMLDetailsElement) {
      section.open = true;
      section.querySelector("summary").focus({ preventScroll: true });
    }
    section.scrollIntoView({ block: "nearest" });
  });
}

saved = loadSavedProfile();
if (saved) showLogin();
