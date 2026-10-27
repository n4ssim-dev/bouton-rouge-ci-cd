const request = require("supertest");
const app = require("./server");

describe("POST /login", () => {
	test("accepte les bons identifiants", async () => {
		const res = await request(app)
			.post("/login")
			.send({ username: "admin", password: "docker" });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("Bienvenue. Et surtout, ne touche pas au bouton.");
	});

	test("refuse un mauvais mot de passe", async () => {
		const res = await request(app)
			.post("/login")
			.send({ username: "admin", password: "mauvais" });

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe("Identifiants incorrects.");
	});

	test("refuse un mauvais nom d'utilisateur", async () => {
		const res = await request(app)
			.post("/login")
			.send({ username: "root", password: "docker" });

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
	});

	test("refuse une requête sans corps", async () => {
		const res = await request(app).post("/login");

		expect(res.status).toBe(401);
		expect(res.body.success).toBe(false);
	});
});

describe("POST /click", () => {
	test("renvoie le premier message pour count = 1", async () => {
		const res = await request(app).post("/click").send({ count: 1 });

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			count: 1,
			message: "Je t'avais pourtant prévenu.",
			finished: false
		});
	});

	test("renvoie un message pour chaque clic de 1 à 29 sans terminer", async () => {
		for (let count = 1; count < 30; count++) {
			const res = await request(app).post("/click").send({ count });

			expect(res.status).toBe(200);
			expect(res.body.count).toBe(count);
			expect(typeof res.body.message).toBe("string");
			expect(res.body.message.length).toBeGreaterThan(0);
			expect(res.body.finished).toBe(false);
		}
	});

	test("termine la partie au 30e clic", async () => {
		const res = await request(app).post("/click").send({ count: 30 });

		expect(res.status).toBe(200);
		expect(res.body.finished).toBe(true);
		expect(res.body.message).toMatch(/^BOUM !/);
	});

	test.each([
		["0", 0],
		["négatif", -1],
		["supérieur à 30", 31],
		["décimal", 1.5],
		["chaîne de caractères", "5"],
		["null", null]
	])("refuse un count %s", async (_, count) => {
		const res = await request(app).post("/click").send({ count });

		expect(res.status).toBe(400);
		expect(res.body.error).toBe("Le nombre de clics doit être compris entre 1 et 30.");
	});

	test("refuse une requête sans count", async () => {
		const res = await request(app).post("/click").send({});

		expect(res.status).toBe(400);
	});
});
