import { Hono } from "hono";

const helloworld = new Hono();

helloworld.get("/", async (c) => {
  return c.text("Hello World!");
});

export default helloworld;
