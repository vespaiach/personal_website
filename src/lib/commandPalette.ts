import Alpine from "alpinejs";

export function openCommandPalette() {
  const dialog = document.getElementById("command-palette") as HTMLDialogElement;
  if (!dialog) return;
  if (!dialog.open) {
    dialog.showModal();
  }
}

export function closeCommandPalette() {
  const dialog = document.getElementById("command-palette") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
    Alpine.$data(dialog).reset();
  }
}

export function toggleCommandPalette() {
  const dialog = document.getElementById("command-palette") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    closeCommandPalette();
  } else {
    dialog.showModal();
  }
}