@AGENTS.md

** When writing tailwind classes** :

- Please use tailwind classe units, instead of h-[80px] use h-20 and so on.
- Always check if there is a tailwind class for the use case (eg for bg-indigo-500-200).
- When defining a custom color, try to use the tailwind color system (eg --tw-indigo-500: #4f46e5)
- Do not repeat yourself, use the existing tailwind classes

** When writing react components ** :

- Use best practises for creating components and writing code.
- Make components as reusable as possible.
- Do not write inline styles, use tailwind classes instead.
- If the component is not reusable, make it a functional component.
- Don't abuse the useState, use variables instead.
- Use one variable per feature, don't create multiple variables for the same feature, even if it is used in different scenarios.
