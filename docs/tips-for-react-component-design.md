---
title: 'Tips for React Component Design'
date: '2025-03-26'
excerpt: "In React projects, it's common to have hundreds of components—or even more—as the project evolves and scales. Without proper organization and design guidelines, managing these components can become challenging, making it difficult to locate or update them efficiently. In this post, I'll share my experiences and insights on designing and organizing React components in ways that I believe are beneficial for React projects overall."
github: https://github.com/vespaiach/personal_website/blob/main/docs/tips-for-react-component-design.md
tags: react
---

In React projects, it's common to have hundreds of components—or even more—as the project evolves and scales. Without proper organization and design guidelines, managing these components can become challenging, making it difficult to locate or update them efficiently. In this post, I'll share my experiences and insights on designing and organizing React components in ways that I believe are beneficial for React projects overall.

## Passive & Active Components

Passive components focus solely on rendering views and visualizing data. They do not handle integrations, such as communication with external services or APIs, or processing data for other components.

Active components, on the other hand, are responsible for tasks like calling APIs or external services and preprocessing data before passing it to passive components.

This separation of concerns is a foundational step in organizing React components. Passive components are more reusable, easier to test, and can be implemented independently without relying on integrations.

## Custom hooks

Whenever possible, encapsulate application logic—such as API calls, data handling, data transformation, and validation—into React custom hooks. This approach promotes reusability of the logic and facilitates integration testing.

```jsx
/**
 * Example: Encapsulating integration logic into a custom hook
 **/
const API_URL = '/api-url';

export function useTrackAppActivity() {
  return useCallback((activity: string) => {
    try {
      if (navigator.sendBeacon !== undefined && navigator.sendBeacon(API_URL, activity)) return;
      void fetch(API_URL, { method: 'POST', keepalive: true });
    } catch (error) {
      // Notify error tracking service or handle the error as needed
      console.error(error);
    }
  }, []);
}
```

