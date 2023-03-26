# HTML Score GitHub Action

This GitHub Action generates an score based on your HTML in your codebase.

## Example Workflow

Here's an example workflow file to use the HTML Score GitHub Action:

```yaml
name: HTML Score

on:
  push:
    branches:
      - master

jobs:
  html-score:
    runs-on: ubuntu-latest
    steps:
      - name: Install Node.js
        uses: actions/setup-node@v3.5.1
        with:
          node-version: '16.x'
      
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Run HTML Score
        uses: suryaumapathy2812/html-tagger@v1
        with:
          start-point: './'
      
      - name: HTML level 1 Score
        run: |
          echo "Level_1 Score: ${{ steps.html-score.outputs.level_1 }}"

      - name: HTML level 2 Score
        run: |
          echo "Level_2 Score: ${{ steps.html-score.outputs.level_2 }}"

      - name: HTML level 3 Score
        run: |
          echo "Level_3 Score: ${{ steps.html-score.outputs.level_3 }}"