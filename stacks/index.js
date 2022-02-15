import MeerkatStack from "./MeerkatStack";

export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs12.x",
  });

  new MeerkatStack(app, "stack");

  // Add more stacks
}
