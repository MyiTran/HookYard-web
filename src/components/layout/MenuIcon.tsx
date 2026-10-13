import ActivityIcon from "../icons/ActivityIcon";
import BuildingIcon from "../icons/BuildingIcon";
import GridIcon from "../icons/GridIcon";
import PlugIcon from "../icons/PlugIcon";
import RefreshIcon from "../icons/RefreshIcon";
import SearchAlertIcon from "../icons/SearchAlertIcon";
import UsersIcon from "../icons/UsersIcon";

type MenuIconProps = { name: string; };

function MenuIcon({ name }: MenuIconProps) {
  if (name === "Overview") {
    return <GridIcon />;
  }

  if (name === "Support accounts") {
    return <UsersIcon />;
  }

  if (name === "Project") {
    return <BuildingIcon />;
  }

  if (name === "Endpoints") {
    return <PlugIcon />;
  }

  if (name === "Deliveries") {
    return <ActivityIcon />;
  }

  if (name === "Replay") {
    return <RefreshIcon />;
  }

  return <SearchAlertIcon />;
}

export default MenuIcon;
