/** @description Router class to handle routing in a single page application
 * @constructor
 * @param {Array} routes - An array of objects containing the path and component
 */

class Router {
  constructor(routes) {
    this.routes = routes;
    this.loadInitialRoute();
  }

  loadInitialRoute() {
    this.initLinkHandlers();
    window.addEventListener("popstate", () =>
      this.loadRoute(location.pathname),
    );
    this.loadRoute(location.pathname);
  }

  initLinkHandlers() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      if (link.hasAttribute("data-link")) {
        e.preventDefault();
        this.navigateTo(link.getAttribute("href"));
      }
    });
  }
  navigateTo(url) {
    history.pushState(null, null, url);
    this.loadRoute(url);
  }

  loadRoute(url) {
    const route = this.matchUrlToRoute(url);
    this.renderPage(route);
  }

  renderPage(route) {
    if (!route) {
      document.querySelector("#app").innerHTML = "<h1>404: Page Not Found</h1>";
      return;
    }

    //TODO: update this function to render web components

    const app = document.querySelector("#app");
    app.innerHTML = "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = route.component;
    const element = tempDiv.firstElementChild;

    app.appendChild(element);
  }

  matchUrlToRoute(url) {
    if (url === "/") {
      return this.routes.find((route) => route.path === "/");
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
        return routeSegment === urlSegments[i] || routeSegment.startsWith(":");
      });
    });

    return matchedRoute;
  }

  getParams() {
    const currentPath = location.pathname;
    const route = this.matchUrlToRoute(currentPath).path.split("/").slice(1);

    if (!route) return;

    const currentPathSegments = currentPath.split("/").slice(1);
    const routeParams = {};

    route.forEach((segment, i) => {
      if (segment.startsWith(":")) {
        const propName = segment.slice(1);
        routeParams[propName] = currentPathSegments[i];
      }
    });

    return routeParams;
  }
}

export default Router;
