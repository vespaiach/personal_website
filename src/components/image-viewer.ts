import Alpine from "alpinejs";

const POST_IMAGE_SELECTOR = ".content-view img";

interface DialogRefs {
  $refs: { dialog: HTMLDialogElement };
}

export function registerImageViewer() {
  Alpine.data("imageViewer", () => ({
    src: "",
    alt: "",

    open(event: MouseEvent) {
      const image = (event.target as Element).closest<HTMLImageElement>(POST_IMAGE_SELECTOR);
      if (!image) return;
      this.src = image.src;
      this.alt = image.alt;
      (this as unknown as DialogRefs).$refs.dialog.showModal();
    },

    close() {
      (this as unknown as DialogRefs).$refs.dialog.close();
    },
  }));
}