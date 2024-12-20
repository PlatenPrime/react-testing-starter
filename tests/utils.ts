import { http, delay, HttpResponse } from "msw";
import { server } from "./mocks/server";

export const simulateDalay = (endpoint: string) =>
  server.use(
    http.get(endpoint, async () => {
      await delay();
      return HttpResponse.json([]);
    })
  );

export const simulateError = (endpoint: string) =>
  server.use(
    http.get(endpoint, async () => {
      await delay();
      return HttpResponse.error();
    })
  );
