import { beforeEach, describe, expect, it, vi } from "vitest";

interface ImageViewer {
  src: string;
  alt: string;
  open(event: MouseEvent): void;
  close(): void;
  $refs: { dialog: { showModal(): void; close(): void } };
}

let factory: () => ImageViewer;

vi.mock("alpinejs", () => ({
  default: {
    data(_name: string, callback: typeof factory) {
      factory = callback;
    },
  },
}));

const { registerImageViewer } = await import("./image-viewer.ts");

function clickOn(image: { src: string; alt: string } | null) {
  return { target: { closest: () => image } } as unknown as MouseEvent;
}

describe("imageViewer", () => {
  const showModal = vi.fn();
  const close = vi.fn();
  let viewer: ImageViewer;

  beforeEach(() => {
    showModal.mockReset();
    close.mockReset();
    registerImageViewer();
    viewer = factory();
    viewer.$refs = { dialog: { showModal, close } };
  });

  it("opens the clicked post image in full view", () => {
    viewer.open(clickOn({ src: "/images/diagram.png", alt: "A diagram" }));

    expect(viewer.src).toBe("/images/diagram.png");
    expect(viewer.alt).toBe("A diagram");
    expect(showModal).toHaveBeenCalledOnce();
  });

  it("ignores clicks outside post images", () => {
    viewer.open(clickOn(null));

    expect(showModal).not.toHaveBeenCalled();
  });

  it("closes the dialog", () => {
    viewer.close();

    expect(close).toHaveBeenCalledOnce();
  });
});