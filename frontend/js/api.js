// API Client - wraps backend API calls with localStorage fallback
const API_BASE = ""; // Set to backend URL when ready, e.g. 'http://localhost:3000/api'
const USE_API = false; // Toggle to true when backend is running

const api = {
  // ─── Auth ────────────────────────────────────────────────────────
  async login(email, password) {
    if (!USE_API) return { success: false, message: "API not connected" };
    return this._fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email, password, name) {
    if (!USE_API) return { success: false, message: "API not connected" };
    return this._fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  // ─── Suppliers ───────────────────────────────────────────────────
  async getSuppliers() {
    if (!USE_API) {
      const data = localStorage.getItem("suppliers");
      return data ? JSON.parse(data) : [];
    }
    return this._fetch("/suppliers");
  },

  async createSupplier(name) {
    if (!USE_API) {
      const suppliers = await this.getSuppliers();
      const newSupplier = { id: Date.now().toString(), name };
      suppliers.push(newSupplier);
      localStorage.setItem("suppliers", JSON.stringify(suppliers));
      return newSupplier;
    }
    return this._fetch("/suppliers", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async deleteSupplier(id) {
    if (!USE_API) {
      let suppliers = await this.getSuppliers();
      suppliers = suppliers.filter((s) => s.id !== id);
      localStorage.setItem("suppliers", JSON.stringify(suppliers));
      return { success: true };
    }
    return this._fetch("/suppliers/" + id, { method: "DELETE" });
  },

  // ─── Materials ───────────────────────────────────────────────────
  async getMaterials(supplierId) {
    if (!USE_API) {
      const key = supplierId ? "materials_" + supplierId : "materials";
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    const query = supplierId ? "?supplierId=" + supplierId : "";
    return this._fetch("/materials" + query);
  },

  async createMaterial(supplierId, material) {
    if (!USE_API) {
      const key = "materials_" + supplierId;
      const materials = await this.getMaterials(supplierId);
      const newMaterial = {
        id: Date.now().toString(),
        supplierId,
        ...material,
      };
      materials.push(newMaterial);
      localStorage.setItem(key, JSON.stringify(materials));
      return newMaterial;
    }
    return this._fetch("/materials", {
      method: "POST",
      body: JSON.stringify({ supplierId, ...material }),
    });
  },

  async updateMaterial(id, data) {
    if (!USE_API) {
      // In localStorage mode, updates are handled by the app directly
      return { success: true, id, ...data };
    }
    return this._fetch("/materials/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteMaterial(id) {
    if (!USE_API) {
      // In localStorage mode, deletions are handled by the app directly
      return { success: true };
    }
    return this._fetch("/materials/" + id, { method: "DELETE" });
  },

  // ─── Categories ──────────────────────────────────────────────────
  async getCategories() {
    if (!USE_API) {
      const data = localStorage.getItem("categories");
      return data ? JSON.parse(data) : [];
    }
    return this._fetch("/categories");
  },

  async createCategory(name) {
    if (!USE_API) {
      const categories = await this.getCategories();
      const newCategory = { id: Date.now().toString(), name };
      categories.push(newCategory);
      localStorage.setItem("categories", JSON.stringify(categories));
      return newCategory;
    }
    return this._fetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async deleteCategory(id) {
    if (!USE_API) {
      let categories = await this.getCategories();
      categories = categories.filter((c) => c.id !== id);
      localStorage.setItem("categories", JSON.stringify(categories));
      return { success: true };
    }
    return this._fetch("/categories/" + id, { method: "DELETE" });
  },

  // ─── Jobs ────────────────────────────────────────────────────────
  async getJobs() {
    if (!USE_API) {
      const data = localStorage.getItem("savedJobs");
      return data ? JSON.parse(data) : [];
    }
    return this._fetch("/jobs");
  },

  async saveJob(job) {
    if (!USE_API) {
      const jobs = await this.getJobs();
      const newJob = {
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        ...job,
      };
      jobs.push(newJob);
      localStorage.setItem("savedJobs", JSON.stringify(jobs));
      return newJob;
    }
    return this._fetch("/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  async deleteJob(id) {
    if (!USE_API) {
      let jobs = await this.getJobs();
      jobs = jobs.filter((j) => j.id !== id);
      localStorage.setItem("savedJobs", JSON.stringify(jobs));
      return { success: true };
    }
    return this._fetch("/jobs/" + id, { method: "DELETE" });
  },

  // ─── Supplier Pricing API ────────────────────────────────────────
  async fetchSupplierPricing(supplierName) {
    // Future: connect to supplier APIs for live pricing
    // For now returns null (use local data)
    if (!USE_API) return null;
    try {
      return await this._fetch(
        "/suppliers/pricing?name=" + encodeURIComponent(supplierName),
      );
    } catch (e) {
      console.warn("Supplier pricing fetch failed:", e.message);
      return null;
    }
  },

  // ─── Helper ──────────────────────────────────────────────────────
  async _fetch(endpoint, options = {}) {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
    const res = await fetch(API_BASE + endpoint, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Request failed with status " + res.status);
    }
    return res.json();
  },
};
