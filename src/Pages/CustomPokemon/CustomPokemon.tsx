import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Button, Container, FormControl, Modal } from "react-bootstrap";
import { AiOutlineClose } from "react-icons/ai";
import { BsGearFill } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import CustomPokemonCardContainer from "../../components/CustomPokemonCardContainer/CustomPokemonCardContainer";
import { fetchAllCustomPokemon } from "../../fetchData/fetch";
import { CustomPokemon as CP } from "../../types";
import { typeColors } from "../../utils/typeColors";
import "./customPokemon.scss";

const CustomPokemon = ({}) => {
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
  const [filters, setFilters] = useState<{
    name: string;
    type: string;
    sort: string;
  }>({
    name: nameValue,
    type: "All",
    sort: "nameAsc",
  });
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "custom"],
    queryFn: fetchAllCustomPokemon,
    cacheTime: Infinity,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data || !scrolled) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <h1 className="text-center text-primary">{`Loading Custom Pokemon...`}</h1>
        <img
          alt="loading gif"
          style={{ width: "250px", height: "auto" }}
          src={"https://c.tenor.com/q16e8L6YA30AAAAj/helicopter-raichu.gif"}
        />
        <img
          alt="loading gif"
          style={{ width: "250px", height: "auto" }}
          src={"https://thumbs.gfycat.com/BrokenForkedElephant-max-1mb.gif"}
        />
      </div>
    );
  }

  const customPokemon = Object.values(data);

  const filterType = (cards: CP[]) => {
    if (filters.type !== "All") {
      const typeFilter: string = filters.type;
      return cards.filter((p) => {
        return p.types.includes(typeFilter.toLowerCase());
      });
    }
    return cards;
  };

  const filterName = (cards: CP[]) => {
    if (filters.name !== "") {
      const nameFilter: string = filters.name;
      return cards.filter((p) => {
        return p.pk.toLowerCase().includes(nameFilter.toLowerCase());
      });
    }
    return cards;
  };

  const sortCards = (cards: CP[]) => {
    return cards.sort((a, b) => {
      if (filters.sort === "nameAsc") {
        return a.pk.localeCompare(b.pk);
      } else {
        return b.pk.localeCompare(a.pk);
      }
    });
  };

  const filterAll = (cards: CP[]) => {
    const filteredType = filterType(cards);
    const filteredName = filterName(filteredType);
    return sortCards(filteredName);
  };

  return (
    <>
      <Container
        fluid
        className="d-flex flex-column align-items-center home-container d-flex justify-content-between"
      >
        <h1 className="header text-center">Custom Pokemon</h1>
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
      <Container>
        {isLoading || isError || !data ? (
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
              <div className="d-flex flex-column flex-sm-row">
                <Button
                  variant="secondary"
                  className="my-2 custom-pokemon-btn mx-1"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Normal Pokemon
                </Button>
                <Button
                  variant="secondary"
                  className="my-2 custom-pokemon-btn mx-1"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/custom/create", {
                      state: {
                        ...calculateCrumbs(location, {
                          active: false,
                          content: "Create Pokemon",
                          to: `/custom/create`,
                        }),
                      },
                    });
                  }}
                >
                  Create Pokemon
                </Button>
              </div>
            </section>
            <CustomPokemonCardContainer
              cards={filterAll([
                ...customPokemon.sort((a, b) => a.pk.localeCompare(b.pk)),
              ])}
            />
          </main>
        )}
      </Container>
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
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
          <h4 className="text-primary">Sort By:</h4>
          <FormControl
            className="text-primary mb-3"
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            value={filters.sort}
            as="select"
          >
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
    </>
  );
};

export default CustomPokemon;
