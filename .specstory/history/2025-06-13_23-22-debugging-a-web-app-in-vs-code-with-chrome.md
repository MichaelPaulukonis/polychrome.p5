<!-- Generated by SpecStory -->

# Debugging a web app in VS Code with Chrome (2025-06-13 19:22:15)

_**User**_

How do Iget VS code to debug my web app running in chrome?

---

_**Assistant**_

You can enable Chrome debugging attachment for Live Server and then start a debugging session.

1.  Enable the **liveServer.settings.ChromeDebuggingAttachment** setting. This will allow you to attach the VS Code debugger to an instance of Chrome launched by Live Server. Note that you need to have the 'Debugger for Chrome' extension installed.
     "command",
    		"details": {
    			"key": "workbench.extensions.search",
    			"value": "Debugger for Chrome"
    		}
    	}
    ]
    ": "workbench.action.debug.start"
    		}
    	}
    ]
    

---

_**User**_

I need to debug a Nuxt 2 project. I'm not sure what server it uses, but It's not Live Server.

---

_**Assistant**_

To debug your Nuxt 2 project with Chrome, you can use a VS Code launch configuration.

1.  Start your Nuxt development server by running the `dev` script from your `package.json` in the terminal:
    ````sh
    npm run dev
    ````
    This usually starts the server on `http://localhost:3000`.

2.  Add the following configuration to your `launch.json` file in the `` directory. If the file doesn't exist, you can create it.

    ````json
    // filepath: .vscode/launch.json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "chrome",
          "request": "launch",
          "name": "Launch Nuxt App in Chrome",
          "url": "http://localhost:3000",
          "webRoot": "${workspaceFolder}",
          "sourceMaps": true,
          "breakOnLoad": true,
          "pathMapping": {
            "/_nuxt/": "${webRoot}/.nuxt/",
            "/~": "${webRoot}/",
            "/@": "${webRoot}/"
          }
        }
      ]
    }
    ````
    This configuration will launch a new Chrome instance and attach the VS Code debugger to it. The `pathMapping` helps the debugger correctly map files served by Nuxt's development server back to your workspace files.

After setting this up, you can go to the Run and Debug view in VS Code, select "Launch Nuxt App in Chrome" from the dropdown, and click the play button to start debugging.

---

