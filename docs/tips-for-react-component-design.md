---
title: 'Tips for React Component Design'
date: '2025-03-26'
excerpt: "Discover essential tips for designing and organizing React components to improve scalability, reusability, and maintainability in your projects. Learn best practices for naming, structuring, and optimizing components for efficient development."
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

## Naming components

Creating meaningful names for components can be challenging. Developers often name components based on their immediate thoughts, believing the names are good. However, these names may later be questioned by other developers or even by the original creator when revisiting the code in the future.

Some general rules for good namings are:

- **Be Specific**: Avoid vague names like data. Instead, use descriptive ones like usersData2025.
- **Ensure Readability**: Choose a consistent naming convention, such as camelCase, snake_case, or PascalCase, and stick to it throughout.
- **Collaborate**: Adhere to team conventions, ensuring that everyone is aligned on naming standards.

React component names follow community guidelines, such as using PascalCase for component names and prefixing custom hooks with "use". Thankfully, ESLint rules can help us avoid naming violations.

In addition to these guidelines, the following rules can make component names more meaningful:

- Passive Components: These represent a piece of the UI, so they should be named based on the view they render. For instance, BlogPost, ContactForm, or DatePicker. Aim to use nouns or noun phrases.

- Active Components: Name these based on their responsibilities or purpose. Examples include UserListContainer, UserHomePage, or UserProfileView. Active component names may seem similar to passive ones because containers, pages, or views are still part of the UI. However, when implementing a UI, we often break it into smaller components. These smaller components form part of a larger component, which acts as a coordinator to assemble the complete UI. For this reason, active components often include terms like "container," "page," or "view" to reflect their coordinating role.

- Prefix with Parent Name: When components are tightly coupled with a parent component, include the parent name as a prefix. For example: UserProfile and UserProfileAvatar.

- Keep Names Short and Concise: do so as much as possible. While this can be challenging, long component names often indicate that they should be organized into subfolders for better structure and readability. For example, instead of naming a component BlogPostCommentsSectionHeader, we could name it CommentsSectionHeader and place it inside a BlogPost folder.

## Group Components into Folders

Placing all components into a single file can help prevent unintended imports from external sources but often leads to bloated files that are hard to read and maintain. A better approach is to break components into separate files, group those files into a folder, and re-export components using an index.tsx file. This structure allows other files in the folder to be treated as private, improving organization. Test files can also be placed within the same folder for better cohesion.

```base
/BlogPost
  - BlogPost.tsx
  - BlogPostAuthor.tsx
  - BlogPostComments.tsx
  - index.tsx
  - BlogPost.test.tsx
```

## Arrow Function vs Regular Function

React allows components to be defined using either arrow functions or regular functions. The choice between the two often depends on personal preference. A good rule for team collaboration and code readability is to pick one style and stick with it, avoiding inconsistency.

Personally, I prefer regular functions over arrow functions because of hoisting and the availability of function names, which can make debugging and stack traces more informative.

## Single view for reusability

When designing components, aim to break them into smaller, reusable parts, but avoid making them so small that they become fragments. The main purpose of breaking components is to enable reuse in different parts of the project. Over-fragmenting components can lead to an overwhelming number of files, increasing build times, complicating code navigation, and making it harder to come up with meaningful names.

The level of granularity should depend on the component's usage within the project. For example, if a user profile frequently appears in the UI, it makes sense to create a reusable UserProfile component. However, it’s unnecessary to break UserProfile into smaller components like UserProfileName and UserProfileAvatar unless these subcomponents are reused in different contexts.

## Avoid Passing Many Properties to Components

A component that accepts too many properties can make it difficult to predict its behavior and understand its UI from the code. It also complicates controlling unnecessary re-renders, which can lead to poor performance.

React components re-render whenever one of their properties changes. If a component receives ten individual properties, you must monitor changes for all ten to avoid unnecessary re-renders. By grouping these properties into a single object and passing the object to the component, you only need to check for changes in that single object. This works because React performs shallow checks on properties, and objects are considered different when their references change.

A helpful trick some teams use is to avoid transforming API response data from snake_case to camelCase. Instead, they pass the entire API response object to the component, rather than extracting and passing only the specific data the component needs. Although this may have minor drawbacks—such as mixing snake_case and camelCase naming conventions or passing unnecessary data—it provides benefits like easily identifying data origins by naming convention and better control over component re-rendering.

```jsx
// Without grouping properties:
const UserProfile = ({ firstName, profilePhoto, bio }) => {
  return (
    <div>
      <img src={profilePhoto} alt={`${firstName}'s avatar`} />
      <h1>{firstName}</h1>
      <p>{bio}</p>
    </div>
  );
};

// Usage
<UserProfile
  firstName="John"
  profilePhoto="/avatar.jpg"
  bio="Lorem ipsum dolor sit amet"
/>

// Grouping properties:
const UserProfile = ({ user }) => {
  return (
    <div>
      <img src={user.profile_photo} alt={`${user.first_name}'s avatar`} />
      <h1>{user.first_name}</h1>
      <p>{user.bio}</p>
    </div>
  );
};

// Usage
const userApiResponse = {
  first_name: "John Doe",
  profile_photo: "/avatar.jpg",
  bio: "Lorem ipsum dolor sit amet",
};

<UserProfile user={userApiResponse} />;
```