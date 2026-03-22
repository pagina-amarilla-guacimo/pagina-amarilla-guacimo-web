"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Store } from "@/types/store.types";

const QUICK_CATEGORIES = [
  "Farmacia",
  "Supermercado",
  "Restaurante",
  "Banco",
  "Salud",
  "Educación",
  "Servicio",
  "Transporte",
  "Hogar",
  "Tecnología",
  "Turismo",
  "Industria",
];

const DISTRICTS = ["Guácimo", "Pocora", "Río Jiménez"] as const;

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<(typeof DISTRICTS)[number]>("Guácimo");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/stores", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("No se pudo cargar el directorio");
        }

        const data = (await response.json()) as Store[];
        setStores(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error inesperado";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  const dynamicCategories = useMemo(() => {
    const categories = new Set<string>();

    stores.forEach((store) => {
      if (store.category?.name) {
        categories.add(store.category.name);
      }
    });

    return ["Todas", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [stores]);

  const displayedCategories = useMemo(() => {
    const all = [...QUICK_CATEGORIES, ...dynamicCategories.slice(1)];
    return ["Todas", ...Array.from(new Set(all))].slice(0, 12);
  }, [dynamicCategories]);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stores.filter((store) => {
      const matchesCategory =
        selectedCategory === "Todas" ||
        store.category?.name?.toLowerCase() === selectedCategory.toLowerCase();

      const textTarget = [
        store.name,
        store.description,
        store.district,
        store.location,
        store.phoneNumber,
        store.category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || textTarget.includes(normalizedQuery);
      const matchesDistrict = store.district?.toLowerCase() === selectedDistrict.toLowerCase();

      return matchesCategory && matchesDistrict && matchesQuery;
    });
  }, [stores, query, selectedCategory, selectedDistrict]);

  const featuredStores = filteredStores.slice(0, 8);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="home-page">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-logo-shell">
            {logoError ? (
              <div className="brand-badge">CC</div>
            ) : (
              <Image
                src="/camara-comercio-logo.png"
                alt="Logo de la Camara de Comercio"
                width={52}
                height={52}
                className="brand-logo"
                priority
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <div>
            <p className="brand-title">Camara de Comercio de Guácimo</p>
            <p className="brand-subtitle">Guacimo, Pocora y Río Jiménez, Costa Rica</p>
          </div>
        </div>

        <div className="topbar__year">
          <span>Directorio Empresarial</span>
          <strong>2026</strong>
          <Link href="/login" className="topbar__login">
            Inicio de sesion
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__eyebrow">Paginas Amarillas de Costa Rica</p>
          <h1>Directorio de Comercios de Guacimo, Pocora y Río Jiménez</h1>
          <p className="hero__description">
            Encuentra comercios y servicios confiables de nuestra comunidad en segundos.
          </p>

          <form className="search-panel" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar negocios, servicios o productos..."
              aria-label="Buscar negocios"
            />
            <select
              value={selectedDistrict}
              onChange={(event) =>
                setSelectedDistrict(event.target.value as (typeof DISTRICTS)[number])
              }
              aria-label="Filtrar por distrito"
            >
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <button type="submit">Buscar</button>
          </form>
        </div>
      </section>

      <section className="results">
        <div className="section-heading">
          <h2>Comercios destacados</h2>
          <p>
            {isLoading
              ? "Cargando directorio..."
              : `${filteredStores.length} resultado(s) para tu busqueda.`}
          </p>
        </div>

        {errorMessage ? (
          <p className="state-message state-message--error">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && featuredStores.length === 0 ? (
          <p className="state-message">No encontramos negocios con ese filtro. Prueba otra busqueda.</p>
        ) : null}

        <div className="store-grid">
          {featuredStores.map((store) => (
            <article key={store.id} className="store-card">
              <div className="store-card__pill">{store.category?.name ?? "Sin categoria"}</div>
              <h3>{store.name}</h3>
              <p>{store.description}</p>

              <dl>
                <div>
                  <dt>Ubicacion</dt>
                  <dd>{store.location}</dd>
                </div>
                <div>
                  <dt>Telefono</dt>
                  <dd>{store.phoneNumber}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="categories">
        <div className="section-heading">
          <h2>Encuentra negocios por categoria</h2>
          <p>Filtra rapidamente para descubrir opciones locales.</p>
        </div>

        <div className="category-grid">
          {displayedCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                className={`category-card ${isActive ? "is-active" : ""}`}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}