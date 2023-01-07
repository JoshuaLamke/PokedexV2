import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import z from "zod";
import { useForm, Controller, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  createTheme,
  ThemeProvider,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  FormControl,
  Button,
  FormGroup,
  FormHelperText,
  Box,
  Chip,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import "./createPokemon.scss";
import { typeColors } from "../../utils/typeColors";
import { isArray } from "lodash";
import { capitalize, eggGroups, growthRates } from "../../utils/utils";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { removeCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import { useQueryClient } from "@tanstack/react-query";
import { CustomPokemon } from "../../types";
import cryptojs from "crypto-js";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

const CreatePokemon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const queryClient = useQueryClient();
  const MAX_FILE_SIZE = 2000000;
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
  const pokemonSchema = z
    .object({
      name: z.string().trim().min(1).max(15),
      description: z.string().trim().min(10).max(300),
      ability1: z.string().trim().min(1).max(25),
      ability2: z.string().trim().min(1).max(25),
      hidden_ability: z.string().trim().min(1).max(25),
      img: z
        .any()
        .refine((file) => file && file.length > 0, `Must upload an image.`)
        .refine((file) => {
          return file?.[0]?.size <= MAX_FILE_SIZE;
        }, `Max image size is 2MB.`)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
          "Only .jpg, .jpeg, and .png formats are supported."
        ),
      hp: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      atk: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      def: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      sp_atk: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      sp_def: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      speed: z
        .number()
        .min(1)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      types: z
        .array(z.string())
        .refine((types) => types.length > 0, "Must select at least one type."),
      feet: z
        .number()
        .min(0)
        .max(1000)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      inches: z
        .number()
        .min(0)
        .max(11)
        .nonnegative()
        .int({ message: "Must input a whole number" }),
      pounds: z
        .number()
        .min(1)
        .max(1000000)
        .int({ message: "Must input a whole number" }),
      genus: z.string().trim().min(1).max(15),
      shape: z.string().trim().min(1).max(15),
      color: z.string().trim().min(1).max(15),
      password: z.string().trim().min(8).max(15),
      confirm_password: z.string().trim().min(8).max(15),
      evolves_from: z.string().trim().optional(),
      evolves_to: z.string().trim().optional(),
      has_gender: z.boolean().optional(),
      has_gender_differences: z.boolean().optional(),
      female_rate: z.number().optional(),
      male_rate: z.number().optional(),
      egg_groups: z.array(z.string()).optional(),
      habitat: z.string().trim().optional(),
      capture_rate: z.number().optional(),
      base_happiness: z.number().optional(),
      growth_rate: z.string().optional(),
      is_baby: z.boolean().optional(),
      is_legendary: z.boolean().optional(),
      is_mythical: z.boolean().optional(),
      is_cute: z.boolean().optional(),
    })
    .refine((data) => !(data.feet === 0 && data.inches === 0), {
      message: "Must specify height value for feet or inches.",
      path: ["feet"],
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords must be the same",
      path: ["confirm_password"],
    });

  type Schema = z.infer<typeof pokemonSchema>;
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    register,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: {
      name: "",
      description: "",
      ability1: "",
      ability2: "",
      hidden_ability: "",
      img: {},
      hp: 0,
      atk: 0,
      def: 0,
      sp_atk: 0,
      sp_def: 0,
      speed: 0,
      types: [],
      feet: 0,
      inches: 0,
      pounds: 0,
      genus: "",
      shape: "",
      color: "",
      password: "",
      confirm_password: "",
    },
    resolver: zodResolver(pokemonSchema),
  });

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        "50": "#e7f5ec",
        "100": "#c4e7cf",
        "200": "#9fd7b1",
        "300": "#77c992",
        "400": "#58bd7b",
        "500": "#37b165",
        "600": "#2fa25b",
        "700": "#26904e",
        "800": "#1e7f43",
        "900": "#0d5f2f",
        main: "#58bd7b",
      },
      secondary: {
        "50": "#f7f7fa",
        "100": "#eeeef1",
        "200": "#e2e2e5",
        "300": "#d0d0d2",
        "400": "#ababae",
        "500": "#8a8a8d",
        "600": "#636365",
        "700": "#505052",
        "800": "#323234",
        "900": "#121214",
        main: "#323234",
      },
    },
  });

  const submitPokemon = async (data: Schema) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", data.img[0]);
    formData.append("customPokemonName", data.name);
    const formattedData = {
      stats: {
        hp: data.hp,
        atk: data.atk,
        def: data.def,
        sp_atk: data.sp_atk,
        sp_def: data.sp_def,
        speed: data.speed,
      },
      abilities: [
        {
          name: data.ability1,
          hidden: false,
        },
        {
          name: data.ability2,
          hidden: false,
        },
        {
          name: data.hidden_ability,
          hidden: true,
        },
      ],
      name: data.name,
      description: data.description,
      weight: data.pounds,
      feet: data.feet,
      inches: data.inches,
      img: data.img[0].name,
      genus: data.genus,
      shape: data.shape,
      color: data.color,
      types: data.types,
      password: cryptojs.SHA256(data.password).toString(cryptojs.enc.Base64),
      base_happiness: data.base_happiness,
      capture_rate: data.capture_rate,
      egg_groups: data.egg_groups,
      evolves_from: data.evolves_from,
      evolves_to: data.evolves_to,
      female_rate: data.female_rate,
      growth_rate: data.growth_rate,
      habitat: data.habitat,
      has_gender: data.has_gender,
      has_gender_differences: data.has_gender_differences,
      is_baby: data.is_baby,
      is_cute: data.is_cute,
      is_legendary: data.is_legendary,
      is_mythical: data.is_mythical,
      male_rate: data.male_rate,
      originalData: data,
    };
    try {
      await axios.post(
        "https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/custom/update",
        formattedData
      );
      await axios.post(
        "https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/custom/updateImg",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const { name, originalData, ...rest } = formattedData;
      const currData: Record<string, CustomPokemon> | undefined =
        queryClient.getQueryData(["pokemon", "custom"]);
      queryClient.setQueryData(["pokemon", "custom"], {
        ...currData,
        [data.name]: {
          ...rest,
          pk: name,
          sk: "custom-pokemon",
          deleted: false,
          lastModifiedBy: "pokemon-service",
          image_url: `https://custom-pokemon-images.s3.amazonaws.com/${name.replace(
            / /g,
            "+"
          )}/${rest.img.replace(/ /g, "+")}`,
        },
      });
      navigate("/custom", {
        state: {
          crumbs: removeCrumbs(location, 1),
        },
      });
    } catch (e) {
      alert("Something went wrong with form submission");
      setLoading(false);
    }
  };

  const typeError = errors.types as FieldError | undefined;
  const eggGroupError = errors.egg_groups as FieldError | undefined;
  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="form-header text-center mt-3">Create Pokemon</h1>
      <ThemeProvider theme={theme}>
        <form
          className="rounded p-3 pokemon-form"
          onSubmit={handleSubmit(submitPokemon, (e) => console.log(e))}
          noValidate
        >
          <FormGroup>
            <Row className="g-3 d-flex">
              <h5>Basic Info</h5>
              <Col xs={12}>
                <TextField
                  {...register("name")}
                  className="flex-1"
                  label="Pokemon Name"
                  variant="outlined"
                  fullWidth
                  error={errors.name !== undefined}
                  helperText={errors.name?.message}
                />
              </Col>
              <Col xs={12}>
                <TextField
                  {...register("description")}
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  error={errors.description !== undefined}
                  helperText={errors.description?.message}
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Controller
                  render={({ field: { value, onChange } }) => (
                    <FormControl sx={{ width: "100%" }}>
                      <InputLabel
                        id="type-select-label"
                        error={typeError !== undefined}
                      >
                        Type(s)
                      </InputLabel>
                      <Select
                        value={value}
                        onChange={(e) => {
                          onChange(e);
                          if (
                            isArray(e.target.value) &&
                            e.target.value.length > 2
                          ) {
                            setValue("types", e.target.value.slice(1));
                          }
                        }}
                        labelId="type-select-label"
                        input={<OutlinedInput label="Type(s)" />}
                        multiple
                        variant="outlined"
                        fullWidth
                        error={typeError !== undefined}
                        renderValue={(types) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {types.map((val) => (
                              <Chip
                                color="secondary"
                                key={val}
                                label={capitalize(val)}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {Object.keys(typeColors).map((type) => (
                          <MenuItem key={type} value={type.toLowerCase()}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {typeError && (
                        <FormHelperText error>
                          {typeError.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                  name="types"
                  control={control}
                />
              </Col>
              <Col xs={12}>
                <TextField
                  {...register("ability1")}
                  label="Ability Name 1"
                  variant="outlined"
                  fullWidth
                  error={errors.ability1 !== undefined}
                  helperText={errors.ability1?.message}
                />
              </Col>
              <Col xs={12}>
                <TextField
                  {...register("ability2")}
                  label="Ability Name 2"
                  variant="outlined"
                  fullWidth
                  error={errors.ability2 !== undefined}
                  helperText={errors.ability2?.message}
                />
              </Col>
              <Col xs={12}>
                <TextField
                  {...register("hidden_ability")}
                  label="Hidden Ability"
                  variant="outlined"
                  fullWidth
                  error={errors.hidden_ability !== undefined}
                  helperText={errors.hidden_ability?.message}
                />
              </Col>
              <h5>Stats</h5>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("hp", { valueAsNumber: true })}
                  label="HP"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.hp !== undefined}
                  helperText={errors.hp?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("atk", { valueAsNumber: true })}
                  label="Attack"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.atk !== undefined}
                  helperText={errors.atk?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("def", { valueAsNumber: true })}
                  label="Defense"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.def !== undefined}
                  helperText={errors.def?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("sp_atk", { valueAsNumber: true })}
                  label="Special Attack"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.sp_atk !== undefined}
                  helperText={errors.sp_atk?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("sp_def", { valueAsNumber: true })}
                  label="Special Defense"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.sp_def !== undefined}
                  helperText={errors.sp_def?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("speed", { valueAsNumber: true })}
                  label="Speed"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.speed !== undefined}
                  helperText={errors.speed?.message}
                />
              </Col>
              <h5>Identifying Info</h5>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("feet", { valueAsNumber: true })}
                  label="Height (Feet)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.feet !== undefined}
                  helperText={errors.feet?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("inches", { valueAsNumber: true })}
                  label="Height (Inches)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.inches !== undefined}
                  helperText={errors.inches?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("pounds", { valueAsNumber: true })}
                  label="Weight (Pounds)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.pounds !== undefined}
                  helperText={errors.pounds?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("genus")}
                  label="Genus"
                  variant="outlined"
                  fullWidth
                  error={errors.genus !== undefined}
                  helperText={errors.genus?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("shape")}
                  label="Shape"
                  variant="outlined"
                  fullWidth
                  error={errors.shape !== undefined}
                  helperText={errors.shape?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("color")}
                  label="Color"
                  variant="outlined"
                  fullWidth
                  error={errors.color !== undefined}
                  helperText={errors.color?.message}
                />
              </Col>
              <h5>Image</h5>
              <Col xs={12}>
                <TextField
                  {...register("img")}
                  variant="outlined"
                  type="file"
                  fullWidth
                  error={errors.img !== undefined}
                  helperText={errors.img?.message as string | undefined}
                />
              </Col>
              <h5>Edit/Delete Password</h5>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("password")}
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  error={errors.password !== undefined}
                  helperText={errors.password?.message}
                  label={"Password"}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        style={{ width: "2em" }}
                      >
                        {showPassword ? (
                          <AiFillEye size={20} />
                        ) : (
                          <AiFillEyeInvisible size={20} />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("confirm_password")}
                  variant="outlined"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  error={errors.confirm_password !== undefined}
                  helperText={errors.confirm_password?.message}
                  label="Confirm Password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          style={{ width: "2em" }}
                        >
                          {showConfirmPassword ? (
                            <AiFillEye size={20} />
                          ) : (
                            <AiFillEyeInvisible size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Col>
              <h1 className="text-center">Optional Info</h1>
              <h5>Evolution Info</h5>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("evolves_from")}
                  label="Evolves From"
                  variant="outlined"
                  fullWidth
                  error={errors.evolves_from !== undefined}
                  helperText={errors.evolves_from?.message}
                />
              </Col>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("evolves_to")}
                  label="Evolves To"
                  variant="outlined"
                  fullWidth
                  error={errors.evolves_to !== undefined}
                  helperText={errors.evolves_to?.message}
                />
              </Col>
              <h5>Breeding</h5>
              <Col xs={12} sm={6} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"has_gender"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value || false}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Has Gender?"}
                  labelPlacement="start"
                />
              </Col>
              <Col xs={12} sm={6} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"has_gender_differences"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value || false}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Gender Differences?"}
                  labelPlacement="start"
                />
              </Col>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("male_rate", { valueAsNumber: true })}
                  label="Male Gender Rate"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.male_rate !== undefined}
                  helperText={errors.male_rate?.message}
                />
              </Col>
              <Col xs={12} sm={6}>
                <TextField
                  {...register("female_rate", { valueAsNumber: true })}
                  label="Female Gender Rate"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.female_rate !== undefined}
                  helperText={errors.female_rate?.message}
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Controller
                  render={({ field: { value, onChange } }) => (
                    <FormControl sx={{ width: "100%" }}>
                      <InputLabel
                        id="egg-group-select-label"
                        error={eggGroupError !== undefined}
                      >
                        Egg Group(s)
                      </InputLabel>
                      <Select
                        value={value || []}
                        onChange={(e) => {
                          onChange(e);
                          if (
                            isArray(e.target.value) &&
                            e.target.value.length > 2
                          ) {
                            setValue("egg_groups", e.target.value.slice(1));
                          }
                        }}
                        labelId="egg-group-select-label"
                        input={<OutlinedInput label="Egg Group(s)" />}
                        multiple
                        variant="outlined"
                        fullWidth
                        error={eggGroupError !== undefined}
                        renderValue={(egg_groups) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {egg_groups.map((val) => (
                              <Chip
                                color="secondary"
                                key={val}
                                label={capitalize(val)}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {eggGroups.map((group) => (
                          <MenuItem key={group.value} value={group.value}>
                            {group.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {eggGroupError && (
                        <FormHelperText error>
                          {eggGroupError.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                  name="egg_groups"
                  control={control}
                />
              </Col>
              <h5>Training</h5>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("habitat")}
                  label="Habitat"
                  variant="outlined"
                  fullWidth
                  error={errors.habitat !== undefined}
                  helperText={errors.habitat?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("capture_rate", { valueAsNumber: true })}
                  label="Capture Rate"
                  variant="outlined"
                  fullWidth
                  type="number"
                  error={errors.capture_rate !== undefined}
                  helperText={errors.capture_rate?.message}
                />
              </Col>
              <Col xs={12} sm={4}>
                <TextField
                  {...register("base_happiness", { valueAsNumber: true })}
                  label="Base Happiness"
                  variant="outlined"
                  type="number"
                  fullWidth
                  error={errors.base_happiness !== undefined}
                  helperText={errors.base_happiness?.message}
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <Controller
                  render={({ field: { value, onChange } }) => (
                    <FormControl sx={{ width: "100%" }}>
                      <InputLabel
                        id="growth-rate-select-label"
                        error={eggGroupError !== undefined}
                      >
                        Growth Rate
                      </InputLabel>
                      <Select
                        value={value || ""}
                        onChange={(e) => {
                          onChange(e);
                        }}
                        labelId="growth-rate-select-label"
                        input={<OutlinedInput label="Growth Rate" />}
                        variant="outlined"
                        fullWidth
                        error={errors.growth_rate !== undefined}
                        renderValue={(growth_rate) => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            <Chip color="secondary" label={growth_rate} />
                          </Box>
                        )}
                      >
                        {growthRates.map((rate) => (
                          <MenuItem key={rate.value} value={rate.value}>
                            {rate.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.growth_rate && (
                        <FormHelperText error>
                          {errors.growth_rate.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                  name="growth_rate"
                  control={control}
                />
              </Col>
              <h5>Attributes</h5>
              <Col xs={12} sm={6} lg={3} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"is_baby"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value || false}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Baby?"}
                  labelPlacement="start"
                />
              </Col>
              <Col xs={12} sm={6} lg={3} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"is_cute"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value || false}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Cute?"}
                  labelPlacement="start"
                />
              </Col>
              <Col xs={12} sm={6} lg={3} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"is_legendary"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value || false}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Legendary?"}
                  labelPlacement="start"
                />
              </Col>
              <Col xs={12} sm={6} lg={3} className="d-flex align-items-center">
                <FormControlLabel
                  control={
                    <Controller
                      name={"is_mythical"}
                      control={control}
                      render={({ field: props }) => (
                        <Checkbox
                          {...props}
                          checked={!!props.value}
                          onChange={(e) => props.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={"Mythical?"}
                  labelPlacement="start"
                />
              </Col>
            </Row>
            <div className="w-100 d-flex justify-content-end">
              <Button
                className="mt-3 action-button me-2"
                type="reset"
                variant="contained"
                color="secondary"
                onClick={() => reset()}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                className="mt-3 action-button"
                type="submit"
                variant="contained"
                disabled={loading}
              >
                Submit
              </Button>
            </div>
          </FormGroup>
        </form>
      </ThemeProvider>
    </Container>
  );
};

export default CreatePokemon;
