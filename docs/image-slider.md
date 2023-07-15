---
title: 'Simple solution for image slider'
date: '2023-06-15T16:00:00.000-0500'
excerpt: "In this tutorial, I am going to show you how to build an image slider which is simple and doesn't require much coding but powerful enough for your website. Here is what we are building:"
github: https://github.com/vespaiach/personal_website/blob/main/docs/image-slider.md
tags: javascript
---

<img src="/images/slider.gif" width="300" style="margin: 0 auto;" />

We will need two div tags: one will be an image container to place all images horizontally; another will be a container wrapper to hold the image container and left/right scrolling buttons. Everytime, users click on left/right scrolling buttons, we instruct the image container to scroll to the left/right one image length while performing a little animation to make it look like a slider. The picture below will help you to visualize how all components attach together.

<img src="/images/slider_visual.png" style="margin: 38px auto; max-width: 600px; width: 100%" />

The wrapper is just there to hold scrolling buttons, because if we put those buttons inside the image container, when the image container scrolls, those buttons will move.

```javascript
const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  position: relative; // two scrolling buttons will be positioned to the wrapper
`;
```

Two scrolling buttons need to be positioned accordingly to the left and right of the wrapper

```javascript
const LeftScrollButton = styled.button<{ hide?: boolean }>`
  position: absolute;
  left: 8px;
  top: 50%; // center vertically

  transform: rotate(180deg), translateY(-50%);
`;
const RightScrollButton = styled.button<{ hide?: boolean }>`
  position: absolute;
  left: 8px;
  top: 50%; // center vertically

  transform: translateY(-50%); // center vertically
`;
```

For the image container, I am using a css grid to hold images, but you are free to use other css too, like css flex or table. The idea is to hold all images horizontally. Also, I insert two pseudo-elements, before and after, to leave spacings at the start and end of the image slider, so that when users scroll to start or end images will align the page gap.

```javascript
const ImageContainer = styled.div`
  display: grid; // hold images horizontally
  grid-auto-flow: column;
  gap: ${GRID_GAP}px; 

  overflow: hidden; // hide browser's scroll bar

  // Add padding to the grid container to show gap when scrolling to edges
  &:before,
  &:after {
    content: '';
    display: block;
    width: ${PAGE_GAP - GRID_GAP}px; // assume page gap is larger than grid gap
  }
`;
```

In order to show one image at a time, we need to set the image's width equal to viewport’s width subtract by two page gaps (left and right) and control the scrolling by subtracting or adding to the image container's scroll position by one image's width based on scrolling direction. In short, we are telling the image container that you need to scroll to left/right just one image and remember to do it slow by using option “behavior: smooth”

```javascript
const Image = styled.img`
  width: calc(100vw - ${PAGE_GAP * 2}px); // image's width = viewport's width - left page's gap - right page's gap
  height: 230px;

  object-fit: cover; // make image content fill all image’s frame
`;

const handleLeftScrolling = () => {
    imageContainer.scrollTo({ top: 0, left: imageContainer.scrollLeft - imageWidth, behavior: 'smooth' });
}
const handleRightScrolling = () => {
    imageContainer.scrollTo({ top: 0, left: imageContainer.scrollLeft + imageWidth, behavior: 'smooth' });
}
```


