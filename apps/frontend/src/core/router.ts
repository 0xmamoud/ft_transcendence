interface Route {
  path: string;
  component: () => HTMLElement;
}

type Routes = Route[];

class Router {
  declare routes: Routes;

  constructor(routes: Routes) {
    this.routes = routes;
    this.loadInitialRoute();
  }

  public navigateTo(url: string) {
    history.pushState(null, "", url);
    this.renderPage(url);
  }

  private renderPage(url: string) {
    const match = this.matchUrlToRoute(url);
    if (!match || !match.route) {
      document.querySelector("#app")!.innerHTML = "<h1>404: Page Not Found</h1>";
      return;
    }

    const { route, params } = match;

    const app = document.querySelector("#app")!;
    app.innerHTML = "";

    const component = route.component();
    component.setAttribute("params", JSON.stringify(params));

    app.appendChild(component);

  }

  private loadInitialRoute() {
    this.initLinkHandlers();
    window.addEventListener("popstate", () =>
      this.renderPage(location.pathname)
    );
    this.renderPage(location.pathname)
  }

  private initLinkHandlers() {
    document.addEventListener("click", (e) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      if (link.hasAttribute("data-link")) {
        e.preventDefault();

        const href = link.getAttribute("href");
        if (!href) {
          this.navigateTo("/");
          return;
        }

        this.navigateTo(href);
      }
    });
  }

  private matchUrlToRoute(url: string) {
    const params: Record<string, string> = {};

    if (url === "/") {
      const route = this.routes.find((route) => route.path === "/");
      return { route, params };
    }

    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    const matchedRoute = this.routes.find((route) => {
      if (route.path.split("/").length !== url.split("/").length) {
        return false;
      }

      let routeSegments = route.path.split("/").slice(1);
      let urlSegments = url.split("/").slice(1);

      return routeSegments.every((routeSegment, i) => {
        if (routeSegment.startsWith(":")) {
          const paramName = routeSegment.slice(1);
          params[paramName] = urlSegments[i];
          return true;
        }
        return routeSegment === urlSegments[i];
      });
    });

    return { route: matchedRoute, params };
  }
}

export default Router;
