module.exports = {
  rules: {
    // Type rules
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'type-case': [0, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope rules
    'scope-empty': [2, 'always'],
    'scope-case': [0, 'always', 'lower-case'],

    // Subject rules ( description )
    'subject-case': [0, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],

    // Optional: prevent commits like "feat(auth): Add feature."
    'header-full-stop': [2, 'never', '.'],
  },
}
