import request from "supertest";
import { createApp } from "../src/server";

const app = createApp();

describe("Kiwiland Railroad API", () => {
  it("1. Distance of A-B-C = 9", async () => {
    const res = await request(app).get("/api/distance?path=A-B-C");
    expect(res.body).toEqual({ distance: 9 });
  });

  it("2. Distance of A-D = 5", async () => {
    const res = await request(app).get("/api/distance?path=A-D");
    expect(res.body).toEqual({ distance: 5 });
  });

  it("3. Distance of A-E-D = NO SUCH ROUTE", async () => {
    const res = await request(app).get("/api/distance?path=A-E-D");
    expect(res.body).toEqual({ error: "NO SUCH ROUTE" });
  });

  it("4. Trips C->C with max 3 stops = 2", async () => {
    const res = await request(app).get("/api/trips/stops?start=C&end=C&maxStops=3");
    expect(res.body).toEqual({ count: 2 });
  });

  it("5. Trips A->C with exactly 4 stops = 3", async () => {
    const res = await request(app).get("/api/trips/stops?start=A&end=C&exactStops=4");
    expect(res.body).toEqual({ count: 3 });
  });

  it("6. Shortest route A->C = 9", async () => {
    const res = await request(app).get("/api/shortest?start=A&end=C");
    expect(res.body).toEqual({ distance: 9 });
  });

  it("7. Shortest route B->B = 9", async () => {
    const res = await request(app).get("/api/shortest?start=B&end=B");
    expect(res.body).toEqual({ distance: 9 });
  });

  it("8. Routes C->C with distance < 30 = 7", async () => {
    const res = await request(app).get("/api/routes/max-distance?start=C&end=C&threshold=30");
    expect(res.body).toEqual({ count: 7 });
  });
});
