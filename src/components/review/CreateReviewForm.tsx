"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/provider";
import { useRouter } from "next/navigation";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type PlayMethod,
  type TranslationLayer,
  type Performance,
  type GraphicsSettings,
  PlayMethodEnum,
  TranslationLayerEnum,
  PerformanceEnum,
  GraphicsSettingsEnum,
  SOFTWARE_VERSIONS,
} from "@/server/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AuthPrompt from "@/components/auth/AuthPrompt";
import confetti from "canvas-confetti";
import ScreenshotUpload from "@/components/review/ScreenshotUpload";
import SelectMacConfiguration, {
  getDeviceIcon,
  getHumanReadableFamily,
  MacConfig,
} from "@/components/review/SelectMacConfiguration";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useFormPreferences } from "@/lib/hooks/useFormPreferences";

export type ReviewContentWrapperProps = {
  gameId: string;
  gameName: string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isDrawer?: boolean;
};

const ConfettiSideCannons = () => {
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  // Single burst from each side with more particles for better effect
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 70,
    startVelocity: 60,
    decay: 0.9,
    gravity: 1,
    ticks: 300,
    origin: { x: 0, y: 0.5 },
    colors: colors,
  });

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 70,
    startVelocity: 60,
    decay: 0.9,
    gravity: 1,
    ticks: 300,
    origin: { x: 1, y: 0.5 },
    colors: colors,
  });
};

export default function CreateReviewForm({
  gameId,
  gameName,
  onOpenChange,
  onClose,
  isDrawer = false,
}: ReviewContentWrapperProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [customVersion, setCustomVersion] = useState(false);
  const [customVersionValue, setCustomVersionValue] = useState("");

  // Screen state for Mac configuration selection
  const [currentScreen, setCurrentScreen] = useState<"form" | "mac-selection">(
    "form"
  );

  const { getPreferences, updatePreference } = useFormPreferences();
  const preferences = getPreferences();
  const [selectedConfig, setSelectedConfig] = useState<MacConfig | null>(null);

  // Mac configurations are now fetched server-side in SelectMacConfiguration

  // Form state with proper typing
  const [formData, setFormData] = useState<{
    fps: string;
    resolution: string;
    notes: string;
    screenshots: string[];
    softwareVersion: string;
    playMethod: PlayMethod;
    translationLayer: TranslationLayer;
    performance: Performance;
    graphicsSettings: GraphicsSettings;
    macConfigIdentifier: string;
  }>({
    fps: "",
    resolution: "",
    notes: "",
    screenshots: [],
    softwareVersion: SOFTWARE_VERSIONS.CROSSOVER[0],
    playMethod: preferences.playMethod ?? PlayMethodEnum.options[1], // Default to CROSSOVER
    translationLayer:
      preferences.translationLayer ?? TranslationLayerEnum.options[0], // Default to DXVK
    performance: PerformanceEnum.options[1], // Default to GOOD
    graphicsSettings: GraphicsSettingsEnum.options[1], // Default to HIGH
    macConfigIdentifier: preferences.macConfigIdentifier || "", // Default to empty
  });

  // Update software version when play method changes
  useEffect(() => {
    if (formData.playMethod) {
      if (formData.playMethod === "CROSSOVER") {
        setFormData((prev) => ({
          ...prev,
          softwareVersion: SOFTWARE_VERSIONS.CROSSOVER[0],
        }));
      } else if (formData.playMethod === "PARALLELS") {
        setFormData((prev) => ({
          ...prev,
          softwareVersion: SOFTWARE_VERSIONS.PARALLELS[0],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          softwareVersion: "",
        }));
      }
    }
  }, [formData.playMethod]);

  // Create review mutation
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      ConfettiSideCannons();
      // Refresh the page after successful submission
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 2000);
    },
    onError: (error) => {
      setError("Error submitting review. Please try again.");
      console.error(error);
    },
  });

  const isSubmitting = createReviewMutation.isPending;

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if event is provided
    if (e) e.preventDefault();

    // Validate required fields
    if (
      !formData.playMethod ||
      !formData.performance ||
      !formData.macConfigIdentifier
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);

    // Determine which software version to use
    const finalSoftwareVersion = customVersion
      ? customVersionValue
      : formData.softwareVersion;

    try {
      // Create the review
      await createReviewMutation.mutateAsync({
        gameId: gameId as string,
        playMethod: formData.playMethod,
        translationLayer:
          formData.playMethod === "CROSSOVER"
            ? formData.translationLayer
            : null,
        performance: formData.performance,
        fps: formData.fps ? parseInt(formData.fps) : null,
        graphicsSettings: formData.graphicsSettings,
        resolution: formData.resolution,
        macConfigIdentifier: formData.macConfigIdentifier,
        notes: formData.notes,
        screenshots: formData.screenshots,
        softwareVersion: finalSoftwareVersion,
      });

      toast("Your review has been submitted successfully!");
    } catch (error) {
      setError("Error submitting review. Please try again.");
      console.error(error);
    }
  };

  // Handle play method selection with fixed typing
  const handlePlayMethodSelect = (method: PlayMethod) => {
    setFormData((prev) => ({ ...prev, playMethod: method }));
    updatePreference("playMethod", method);
  };

  // Helper components specific for Drawer/Dialog
  const Header = isDrawer ? "div" : DialogHeader;
  const Title = isDrawer ? "h3" : DialogTitle;
  const Description = isDrawer ? "p" : DialogDescription;
  const Footer = isDrawer ? "div" : DialogFooter;

  // Helper function to transform performance rating enum values to user-friendly labels
  const transformPerformanceRating = (rating: string): string => {
    // Split the rating by underscore and capitalize each word
    return rating
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleMacConfigSelect = (config: MacConfig) => {
    setSelectedConfig(config);
    setFormData((prev) => ({
      ...prev,
      macConfigIdentifier: config.identifier,
    }));
    updatePreference("macConfigIdentifier", config.identifier);
    setCurrentScreen("form");
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={false}
        animate={{
          x: currentScreen === "form" ? 0 : "-100%",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full"
      >
        {/* Form Screen */}
        <>
          <Header
            className={
              isDrawer ? "grid gap-1.5 p-4 text-center sm:text-left" : undefined
            }
          >
            <Title
              className={
                isDrawer
                  ? "text-lg font-semibold leading-none tracking-tight"
                  : undefined
              }
            >
              Add Experience for {gameName}
            </Title>
            <Description
              className={isDrawer ? "text-sm text-muted-foreground" : undefined}
            >
              Share your experience running this game on your Mac.
            </Description>
          </Header>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
              {error}
            </div>
          )}

          <AuthPrompt promptMessage="To combat spam, please log in to share your experience with this game." />

          <form onSubmit={handleSubmit} className="space-y-6 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Play Method</label>
                <div className="flex gap-4 justify-between">
                  {PlayMethodEnum.options.map((method) => (
                    <div
                      key={method}
                      className={`cursor-pointer flex flex-col items-center ${
                        formData.playMethod === method
                          ? "text-blue-500 font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                      onClick={() => handlePlayMethodSelect(method)}
                    >
                      <div
                        className={`relative p-1 rounded-xl ${
                          formData.playMethod === method
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                      >
                        <img
                          src={`/images/${method.toLowerCase()}.png`}
                          alt={method}
                          className="w-14 h-14 object-contain p-1"
                        />
                      </div>
                      <span className="mt-1 text-sm">
                        {method === "NATIVE"
                          ? "Native"
                          : method === "CROSSOVER"
                            ? "CrossOver"
                            : method === "PARALLELS"
                              ? "Parallels"
                              : "Other"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {formData.playMethod === "CROSSOVER" ||
              formData.playMethod === "PARALLELS" ? (
                <div className="flex flex-col justify-center space-y-2">
                  <label className="block text-sm font-medium">
                    Software Version
                  </label>
                  {!customVersion ? (
                    <div>
                      <Select
                        value={formData.softwareVersion}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setCustomVersion(true);
                          } else {
                            handleSelectChange("softwareVersion", value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select software version" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.playMethod === "CROSSOVER" &&
                            SOFTWARE_VERSIONS.CROSSOVER.map(
                              (version: string) => (
                                <SelectItem key={version} value={version}>
                                  {version}
                                </SelectItem>
                              )
                            )}
                          {formData.playMethod === "PARALLELS" &&
                            SOFTWARE_VERSIONS.PARALLELS.map(
                              (version: string) => (
                                <SelectItem key={version} value={version}>
                                  {version}
                                </SelectItem>
                              )
                            )}
                          <SelectItem key="custom" value="custom">
                            Custom version...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex space-x-2 items-center">
                      <Input
                        type="text"
                        value={customVersionValue}
                        onChange={(e) => setCustomVersionValue(e.target.value)}
                        placeholder={
                          formData.playMethod === "CROSSOVER"
                            ? "e.g., 25.1"
                            : "e.g., 19.1"
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomVersion(false);
                          setCustomVersionValue("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div></div>
              )}

              {formData.playMethod === "CROSSOVER" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Translation Layer
                  </label>
                  <Select
                    value={formData.translationLayer}
                    onValueChange={(value) => {
                      handleSelectChange("translationLayer", value);
                      updatePreference(
                        "translationLayer",
                        value as TranslationLayer
                      );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select translation layer" />
                    </SelectTrigger>
                    <SelectContent>
                      {TranslationLayerEnum.options.map((layer) => (
                        <SelectItem key={layer} value={layer}>
                          {layer === "DXVK"
                            ? "DXVK"
                            : layer === "DXMT"
                              ? "DXMT"
                              : layer === "D3D_METAL"
                                ? "D3D Metal"
                                : "None / Default"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Performance Rating
                </label>
                <Select
                  value={formData.performance}
                  onValueChange={(value) =>
                    handleSelectChange("performance", value)
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select performance rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {PerformanceEnum.options.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {transformPerformanceRating(rating)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  FPS (optional)
                </label>
                <Input
                  type="number"
                  name="fps"
                  value={formData.fps}
                  onChange={handleInputChange}
                  placeholder="e.g. 60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Graphics Settings
                </label>
                <Select
                  value={formData.graphicsSettings}
                  onValueChange={(value) =>
                    handleSelectChange("graphicsSettings", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select graphics settings" />
                  </SelectTrigger>
                  <SelectContent>
                    {GraphicsSettingsEnum.options.map((setting) => (
                      <SelectItem key={setting} value={setting}>
                        {setting === "ULTRA"
                          ? "Ultra"
                          : setting === "HIGH"
                            ? "High"
                            : setting === "MEDIUM"
                              ? "Medium"
                              : "Low"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Resolution (optional)
                </label>
                <Input
                  type="text"
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleInputChange}
                  placeholder="e.g. 1920x1080"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-row items-center gap-2">
                  <label className="block text-sm font-medium">
                    Mac Configuration
                  </label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between rounded-md"
                  onClick={() => setCurrentScreen("mac-selection")}
                >
                  <span className="truncate">
                    {selectedConfig
                      ? `${getHumanReadableFamily(selectedConfig.metadata.family)} ${selectedConfig.metadata.chip} ${selectedConfig.metadata.chipVariant === "BASE" ? "" : selectedConfig.metadata.chipVariant} ${selectedConfig.metadata.year}`
                      : "Select Mac configuration..."}
                  </span>
                  <div className="flex items-center gap-1">
                    {selectedConfig && (
                      <img
                        src={getDeviceIcon(selectedConfig.metadata.family)}
                        alt={`${selectedConfig.metadata.family}`}
                        className="w-4 h-auto"
                      />
                    )}
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </div>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Notes (optional)
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Share your experience, tips, or any issues you encountered..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-row items-center gap-2">
                <label className="block text-sm font-medium">
                  Screenshots (optional)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent className="text-center">
                      <p>
                        Upload up to 3 screenshots (max 10MB each, PNG/JPG/JPEG){" "}
                        <br />
                        Tip:{" "}
                        <a
                          href="https://tinypng.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          www.tinypng.com
                        </a>{" "}
                        can compress your screenshots without visual loss.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <ScreenshotUpload
                gameId={gameId}
                onScreenshotsChange={(screenshots) =>
                  setFormData((prev) => ({ ...prev, screenshots }))
                }
                maxFiles={3}
              />
            </div>

            <Footer
              className={
                isDrawer ? "mt-auto flex flex-col gap-2 p-4" : undefined
              }
            >
              {isDrawer ? (
                // Drawer buttons
                <>
                  <Button
                    type="submit"
                    disabled={isSubmitting || success}
                    size={"lg"}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    size={"lg"}
                    disabled={isSubmitting}
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                // Dialog buttons
                <>
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      type="button"
                      size={"lg"}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isSubmitting || success}
                    size={"lg"}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </>
              )}
            </Footer>
          </form>
        </>
      </motion.div>

      {/* Mac Configuration Selection Screen */}
      {currentScreen === "mac-selection" && (
        <SelectMacConfiguration
          selectedConfigIdentifier={formData.macConfigIdentifier}
          onSelect={handleMacConfigSelect}
          onBack={() => setCurrentScreen("form")}
        />
      )}
    </div>
  );
}
