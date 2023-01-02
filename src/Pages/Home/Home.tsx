import React, { useEffect, useState } from "react";
import { Button, Container, FormControl, Modal } from "react-bootstrap";
import { fetchAllPokemon } from "../../fetchData/fetch";
import { useQuery } from "@tanstack/react-query";
import PokemonCardContainer from "../../components/PokemonCardContainer/PokemonCardContainer";
import { GoTriangleDown } from "react-icons/go";
import { BsGearFill } from "react-icons/bs";
import { typeColors } from "../../utils/typeColors";
import { regions } from "../../utils/utils";
import { CardInfo } from "../../types";
import { AiOutlineClose } from "react-icons/ai";
import "./home.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";

const Home: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    if (!scrolled) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      setTimeout(() => {
        setScrolled(true);
      }, 200);
    }
  }, [scrolled]);
  const [nameValue, setNameValue] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    name: string;
    type: string;
    region: string;
    sort: string;
  }>({
    name: nameValue,
    type: "All",
    region: "All",
    sort: "numberAsc",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "general"],
    queryFn: fetchAllPokemon,
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  const filterRegion = (cards: CardInfo[]) => {
    if (filters.region !== "All") {
      return cards.slice(
        regions[filters.region][0] - 1,
        regions[filters.region][1]
      );
    }
    return cards;
  };

  const filterType = (cards: CardInfo[]) => {
    if (filters.type !== "All") {
      const typeFilter: string = filters.type;
      return cards.filter((p) => {
        return p.types.includes(typeFilter.toLowerCase());
      });
    }
    return cards;
  };

  const filterName = (cards: CardInfo[]) => {
    if (filters.name !== "") {
      const nameFilter: string = filters.name;
      return cards.filter((p) => {
        return isNaN(Number(nameFilter))
          ? p.name.includes(nameFilter.toLowerCase())
          : p.id.toString().includes(nameFilter);
      });
    }
    return cards;
  };

  const sortCards = (cards: CardInfo[]) => {
    return cards.sort((a, b) => {
      if (filters.sort === "numberAsc") {
        return a.id - b.id;
      } else if (filters.sort === "numberDesc") {
        return b.id - a.id;
      } else if (filters.sort === "nameAsc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  };

  const filterAll = (cards: CardInfo[]) => {
    const filteredRegion = filterRegion(cards);
    const filteredType = filterType(filteredRegion);
    const filteredName = filterName(filteredType);
    return sortCards(filteredName);
  };

  return (
    <>
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-between home-container"
      >
        <header className="d-flex flex-column flex-wrap align-items-center mt-3">
          <h1 className="header">Pokedex!</h1>
          <h5 className="text-primary sub-header">By Joshua Lamke</h5>
        </header>
        <div className="d-flex flex-column arrow-container mb-5">
          <GoTriangleDown
            size={30}
            color={"white"}
            style={{ marginBottom: "-10px" }}
          />
          <GoTriangleDown
            size={30}
            color={"white"}
            style={{ marginBottom: "-10px" }}
          />
          <GoTriangleDown size={30} color={"white"} />
        </div>
      </Container>
      {isLoading || isError || !data || !data.length || !scrolled ? (
        <>{"Loading"}</>
      ) : (
        <main>
          <section className="mb-3 w-100 d-flex flex-column align-items-center">
            <h3 className="text-primary">Search For Pokemon</h3>
            <div id="search-container" className="d-flex align-items-center">
              <input
                type="text"
                id="home-pokemon-search"
                className="w-100"
                placeholder="Search..."
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  setFilters({
                    ...filters,
                    name: e.target.value,
                  });
                }}
              />
              <BsGearFill
                style={{ fill: "var(--bs-primary)" }}
                size={30}
                id="gear-icon"
                onClick={() => setModalOpen(true)}
              />
            </div>
            <Button
              variant="secondary"
              className="my-2 custom-pokemon-btn"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/custom", {
                  state: {
                    ...calculateCrumbs(location, {
                      active: false,
                      content: "Custom Pokemon",
                      to: "/custom",
                    }),
                  },
                });
              }}
            >
              Custom Pokemon
            </Button>
          </section>
          <PokemonCardContainer
            pokemon={filterAll([...data.sort((a, b) => a.id - b.id)])}
          />
          <Modal
            show={modalOpen}
            onHide={() => setModalOpen(false)}
            centered
            backdrop="static"
          >
            <Modal.Header>
              <Modal.Title>
                <h2 className="text-primary">Pokemon Filters</h2>
              </Modal.Title>
              <AiOutlineClose
                style={{ fill: "var(--bs-primary)" }}
                size={30}
                id="modal-close"
                onClick={() => setModalOpen(false)}
              />
            </Modal.Header>
            <Modal.Body>
              <h4 className="text-primary">Filter By Type:</h4>
              <FormControl
                className="text-primary"
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                value={filters.type}
                as="select"
              >
                <option value="All">All Types</option>
                {Object.keys(typeColors).map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </FormControl>
              <h4 className="text-primary mt-3">Filter By Region:</h4>
              <FormControl
                className="text-primary mb-3"
                onChange={(e) =>
                  setFilters({ ...filters, region: e.target.value })
                }
                value={filters.region}
                as="select"
              >
                <option value="All">All Regions</option>
                {Object.keys(regions).map((region) => (
                  <option value={region} key={region}>
                    {region}
                  </option>
                ))}
              </FormControl>
              <h4 className="text-primary">Sort By:</h4>
              <FormControl
                className="text-primary mb-3"
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value })
                }
                value={filters.sort}
                as="select"
              >
                <option value="numberAsc">Number (Ascending)</option>
                <option value="numberDesc">Number (Descending)</option>
                <option value="nameAsc">Name (Ascending)</option>
                <option value="nameDesc">Name (Descending)</option>
              </FormControl>
              <div className="d-flex flex-row justify-content-start">
                <Button
                  className="my-1 me-1"
                  variant="outline-primary"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="my-1 ms-1"
                  onClick={() => {
                    setFilters({
                      name: "",
                      type: "All",
                      region: "All",
                      sort: "numberAsc",
                    });
                    setNameValue("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </main>
      )}
    </>
  );
};

export default Home;
