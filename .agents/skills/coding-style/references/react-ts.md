# React + TypeScript conventions

## Components

- Functional components only, no class components (S012)
- One component per file, file name in PascalCase (S013)
- Named function declaration, no `React.FC`

```tsx
interface PostCardProps {
  title: string;
  slug: string;
}

function PostCard({ title, slug }: PostCardProps) {
  return (
    <a href={'/posts/' + slug}>
      <h2>{title}</h2>
    </a>
  );
}
```

## Types

- `interface` for object shapes, `type` for unions and aliases
- No `any` (S011); unknown input is `unknown` and narrowed with guards
- Props interfaces are `XxxProps`, colocated above the component
- Optional chaining when reading nested data

## Modules

- ESM only: `import`/`export`, never `require` in `.ts`/`.tsx` (S010)
- Named exports for utilities and hooks; default export only where the
  framework requires it (pages, routes)
- Import order: Node/built-ins, external packages, local (`../`, `./`)

## Hooks

- Hooks live in `use-*.ts` or `use*.ts`, named `useXxx`
- Custom hooks return a plain object or tuple, no classes
- Keep effects small; clean up subscriptions and timers

## State and data

- Derive values instead of storing duplicates
- Prefer `const` bindings; `let` only for reassignment (S007 covers `var`)
- No `console.*` in `src/`; log through the app's logger or throw (S009)

## Styling and markup

- Prefer semantic elements and `className`
- Avoid inline styles except for dynamic values
- Strings use single quotes; JSX attributes use double quotes by convention
