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
  }
}

export function toggleCommandPalette() {
  const dialog = document.getElementById("command-palette") as HTMLDialogElement;
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
  } else {
    dialog.showModal();
  }
}