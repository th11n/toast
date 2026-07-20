import {
  CheckCircleIcon as PhosphorCheckCircleIcon,
  InfoIcon as PhosphorInfoIcon,
  WarningCircleIcon as PhosphorWarningCircleIcon,
  XCircleIcon as PhosphorXCircleIcon,
} from "@phosphor-icons/react";
import {
  CircleAlert as LucideWarningCircleIcon,
  CircleCheck as LucideCheckCircleIcon,
  CircleX as LucideXCircleIcon,
  Info as LucideInfoIcon,
} from "lucide-react";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXCircle,
} from "react-icons/hi2";
import type { ToastIconStyle, ToastIcons } from "./types";

export const toastIconSets: Record<ToastIconStyle, ToastIcons> = {
  phosphor: {
    success: <PhosphorCheckCircleIcon size={18} weight="duotone" />,
    info: <PhosphorInfoIcon size={18} weight="duotone" />,
    warning: <PhosphorWarningCircleIcon size={18} weight="duotone" />,
    error: <PhosphorXCircleIcon size={18} weight="duotone" />,
  },
  lucide: {
    success: <LucideCheckCircleIcon size={18} strokeWidth={2} />,
    info: <LucideInfoIcon size={18} strokeWidth={2} />,
    warning: <LucideWarningCircleIcon size={18} strokeWidth={2} />,
    error: <LucideXCircleIcon size={18} strokeWidth={2} />,
  },
  "react-icons": {
    success: <HiCheckCircle size={18} />,
    info: <HiInformationCircle size={18} />,
    warning: <HiExclamationTriangle size={18} />,
    error: <HiXCircle size={18} />,
  },
};
