# Configuration of Angular 6 SPA in ASP dotnet core 2.1 MVC project.
### Introduction:
Now, in [ASP dotnet core](https://docs.microsoft.com/en-us/aspnet/core/client-side/spa/angular?view=aspnetcore-2.1), it is easy to integrate micro-ui's (many Angular SPA) in different views with easy configuration. 

### prerequisite:
1.  [Dot.net SDK 2.1](https://www.microsoft.com/net/download/dotnet-core/sdk-2.1.300)
2.  Angular cli v6 `npm install -g @angular\cli@6.0.8`

#### Step 1: Create Asp dot net core 2.1 MVC Project.
```
dotnet new mvc -o asp-net-core-angular
```

### Step 2: Create Angular Application.

```
cd asp-net-core-angular
ng new clientApp --style=scss --routing
```

1. Create menu component 1.
        ```
        ng g component menu1
        ```
2. Create  menu component 2.
        ```
        ng g component menu2
        ```
3. Create navigation component
        ```
        ng g component nav
        ```
        Add below code to nav.component.html.
 ```html
<ul>
  <li>
    <h2><a routerLink="/menu1">Menu1</a></h2>
  </li>
  <li>
    <h2><a routerLink="/menu2">Menu2</a></h2>
  </li>
</ul>
```
4. Add navigation component to app.component.html as below.
```
<app-nav></app-nav>
<router-outlet></router-outlet>
```
5. Add below code to app.routing.module.ts
```
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Menu1Component } from "./menu1/menu1.component";
import { Menu2Component } from "./menu2/menu2.component";

export const routes: Routes = [
  { path: '', redirectTo: '/menu1', pathMatch: 'full' },
  { path: 'menu1', component: Menu1Component },
  { path: 'menu2', component: Menu2Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

```

##### Change the path of dist folder in angular.json file to "wwwroot" as below.
 ```"outputPath": "../wwwroot/dist/clientApp",```

### Step:3 Bundling and minification

Bundling and minification are two distinct performance optimizations you can apply in a web app. Used together, bundling and minification improve performance by reducing the number of server requests and reducing the size of the requested static assets. [More details...](https://docs.microsoft.com/en-us/aspnet/core/client-side/bundling-and-minification?view=aspnetcore-2.1)

Add BundlerMinifier.Core nuget package to mvc project.
```
dotnet add package BundlerMinifier.Core --version 2.8.391
```

Create bundleconfig.json file which defines the options for each bundle.

Add below code to bundleconfig.json file.
```
[
  {
    "outputFileName": "wwwroot/css/site.min.css",
    "inputFiles": [
      "wwwroot/css/site.css"
      "wwwroot/dist/clientApp/*.css"
    ]
  },
  {
    "outputFileName": "wwwroot/js/site.min.js",
    "inputFiles": [
      "wwwroot/js/site.js",
      "wwwroot/dist/clientApp/*.js"
    ],
    "minify": {
      "enabled": true,
      "renameLocals": true
    },
    "sourceMap": false
  }
]
```

### Step 4: Configure the Angular and bundling in .csproj file.
Edit the project file and follow below steps.
1. Create properties for angular and wwwroot paths as below.
```
 <PropertyGroup>
    <SpaRoot>clientApp\</SpaRoot>
    <wwwRoot>wwwroot\</wwwRoot>
    <DefaultItemExcludes>$(DefaultItemExcludes);$(SpaRoot)node_modules\**</DefaultItemExcludes>
</PropertyGroup>
```
2. Install npm packages before building the project.
```
<Target Name="DebugEnsureNodeEnv" BeforeTargets="Build" Condition=" '$(Configuration)' == 'Debug' And !Exists('$(SpaRoot)node_modules') ">
    <!-- Ensure Node.js is installed -->
    <Exec Command="node --version" ContinueOnError="true">
      <Output TaskParameter="ExitCode" PropertyName="ErrorCode" />
    </Exec>
    <Error Condition="'$(ErrorCode)' != '0'" Text="Node.js is required to build and run this project. To continue, please install Node.js from https://nodejs.org/, and then restart your command prompt or IDE." />
    <Message Importance="high" Text="Restoring dependencies using 'npm'. This may take several minutes..." />
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install" />
  </Target>
```

3. Build angular application, bundle and minify all css, js files.
```
<Target Name="BuildSpaApp" BeforeTargets="Build" Condition=" '$(Configuration)' == 'Debug' And Exists('$(SpaRoot)node_modules') ">
    <!-- Ensure Node.js is installed -->
    <Exec Command="node --version" ContinueOnError="true">
      <Output TaskParameter="ExitCode" PropertyName="ErrorCode" />
    </Exec>
    <Error Condition="'$(ErrorCode)' != '0'" Text="Node.js is required to build and run this project. To continue, please install Node.js from https://nodejs.org/, and then restart your command prompt or IDE." />
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build" />
    <Exec Command="dotnet bundle" />
  </Target>
```

4. Add dotnet cli tool reference for BundlerMinifier...for running the command ```dotnet bundle```
```
<ItemGroup>
    <DotNetCliToolReference Include="BundlerMinifier.Core" Version="2.6.362" />
</ItemGroup>
```
5. Bundle all css, js files configured in bundleconfig.json to wwwroot folder .min files on pre-publishing.
```
<Target Name="PrepublishScript" BeforeTargets="PrepareForPublish">
    <!-- Bundle all css, js files configured in bundleconfig.json to wwwroot folder .min files -->
    <Exec Command="dotnet bundle" />
  </Target>
```
6. As part of publishing, ensure the JS resources are freshly built in production mode.
```
<Target Name="PublishRunWebpack" AfterTargets="ComputeFilesToPublish">
    <!-- As part of publishing, ensure the JS resources are freshly built in production mode -->
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install" />
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build --prod" />

    <!-- Include the newly-built files in the publish output -->
    <ItemGroup>
      <DistFiles Include="$(wwwRoot)dist\**" />
      <DistFiles Include="$(SpaRoot)node_modules\**" Condition="'$(BuildServerSideRenderer)' == 'true'" />
      <ResolvedFileToPublish Include="@(DistFiles->'%(FullPath)')" Exclude="@(ResolvedFileToPublish)">
        <RelativePath>%(DistFiles.Identity)</RelativePath>
        <CopyToPublishDirectory>PreserveNewest</CopyToPublishDirectory>
      </ResolvedFileToPublish>
    </ItemGroup>
  </Target>
```

Step 5: 
