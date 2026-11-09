"use strict";

const form = document.querySelector("#profile-form");
const intro = document.querySelector("#intro");
const dashboardPhoto = document.querySelector("#dashboard-photo");
const handoff = document.querySelector("#handoff");
const status = document.querySelector("#status");
const sample = document.querySelector("#sample");
const birthDate = form.elements.namedItem("birthDate");
const inputs = [...form.querySelectorAll("input[name]")];
const photoPreview = document.querySelector("#photo-preview");
const photoStatus = document.querySelector("#photo-status");
const download = document.querySelector("#download");
const save = document.querySelector("#save");

let selectedPhoto;
let previewUrl;
let downloadUrl;
let demoValues;

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
  selectedPhoto = file;
  photoPreview.src = previewUrl;
  photoPreview.hidden = false;
  photoStatus.textContent = "Photo selected.";
  status.textContent = "";
}

photoPreview.addEventListener("error", () => {
  selectedPhoto = undefined;
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
  for (const field of handoff.querySelectorAll("[data-profile]")) {
    field.textContent = values[field.dataset.profile];
  }
  dashboardPhoto.src = previewUrl;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (save.disabled) return;

  birthDate.max = today();
  for (const input of inputs) input.value = input.value.trim();
  if (!form.reportValidity()) return;
  if (!selectedPhoto) {
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
    const file = new Blob([JSON.stringify(profile)], { type: "application/json" });
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(file);
    download.href = downloadUrl;
    renderDashboard(details);
    form.hidden = true;
    intro.hidden = true;
    handoff.hidden = false;
    document.querySelector("#handoff-title").focus();
  } catch {
    status.textContent = "The photo could not be processed. Choose another picture and try again.";
  } finally {
    save.disabled = false;
  }
});

document.querySelector("#back").addEventListener("click", () => {
  URL.revokeObjectURL(downloadUrl);
  downloadUrl = undefined;
  download.removeAttribute("href");
  handoff.hidden = true;
  dashboardPhoto.removeAttribute("src");
  intro.hidden = false;
  form.hidden = false;
  document.querySelector("#form-title").focus();
});

sample.addEventListener("click", () => {
  for (const input of inputs) input.value = sampleProfile[input.name];
  status.textContent = "Sample details filled in. Add a photo to finish.";
  inputs[0].focus();
});

document.querySelector("#camera").addEventListener("change", selectPhoto);
document.querySelector("#photo").addEventListener("change", selectPhoto);
birthDate.max = today();
sample.hidden = false;
save.disabled = false;
