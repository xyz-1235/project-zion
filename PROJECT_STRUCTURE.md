# Project Structure

```
project-zion/
├── README.md              # Main project overview
├── LICENSE               # MIT License
├── PROJECT_STRUCTURE.md  # This file - project organization
├── project-zion-app/    # Complete application
│   ├── README-APP.md    # App-specific documentation
│   ├── index.html       # Main interface
│   ├── about.html       # About page
│   ├── how.html        # How it works
│   ├── resources.html  # Resources
│   ├── tips.html       # Tips page
│   ├── src/            # JavaScript files
│   │   ├── animation.js
│   │   ├── logic.js
│   │   └── aitest.js
│   ├── styles/         # CSS stylesheets
│   │   ├── style.css
│   │   └── shared.css
│   ├── netlify/        # Backend functions
│   │   └── functions/
│   │       └── getAIResponse.js
│   ├── assets/         # Images and static files
│   │   ├── flowchart.png
│   │   └── mainpage.png
│   ├── docs/           # Documentation
│   │   ├── AI_INTEGRATION_README.md
│   │   └── NETLIFY_DEPLOYMENT_GUIDE.md
│   ├── package.json    # Dependencies
│   ├── netlify.toml    # Netlify configuration
│   └── .env.example    # Environment variables template
└── .env                # Environment variables (local)
```

## Folder Organization

- **Root Level**: Contains only essential project files (README, LICENSE, structure documentation)
- **project-zion-app/**: Complete application ready for deployment
- **Clean Separation**: Documentation and application code properly organized for hackathon presentation