import Router from "./core/router.js";

const routes = [
  {
    path: "/",
    component: `<div>welcome to home page</div>`,
  },
  {
    path: "/about",
    component: `<div>welcome to about page</div>`,
  },
  {
    path: "/contact",
    component: `<div>welcome to contact page</div>`,
  },
  {
    path: "/posts/:id",
    component: `<div>welcome to post page</div>`,
  },
  {
    path: "/users/:id/:name",
    component: `<div>welcome to user page</div>`,
  },
];
const router = new Router(routes);

//console.log(router.getParams());
