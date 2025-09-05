"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Palette,
  Globe,
} from "lucide-react"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"

interface SettingsModalProps {
  onClose: () => void
  onExpandSidebar?: () => void // 👈 trigger sidebar expansion
}

export function SettingsModal({ onClose, onExpandSidebar }: SettingsModalProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [fontSize, setFontSize] = useState([14])
  const [language, setLanguage] = useState("English")
  const [autoSave, setAutoSave] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState("Default")

  const languages = ["English", "Spanish", "French", "German", "Chinese"]
  const themes = ["Default", "Dark", "Blue", "Green", "Purple"]

  // Auto-expand sidebar when modal is opened
  useEffect(() => {
    if (onExpandSidebar) onExpandSidebar()
  }, [onExpandSidebar])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background shadow-xl rounded-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* Appearance Section */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </h3>

              <div className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle dark/light theme
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <p className="font-medium text-foreground mb-2">Font Size</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Small</span>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={20}
                      min={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">Large</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {fontSize[0]}px
                  </p>
                </div>

                {/* Theme Color */}
                <div>
                  <p className="font-medium text-foreground mb-2">Theme Color</p>
                  <div className="flex gap-3 flex-wrap">
                    {themes.map((t) => (
                      <button
                        key={t}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          t === "Dark"
                            ? "bg-gray-900"
                            : t === "Blue"
                            ? "bg-blue-500"
                            : t === "Green"
                            ? "bg-green-500"
                            : t === "Purple"
                            ? "bg-purple-500"
                            : "bg-gradient-to-r from-pink-500 to-yellow-500"
                        } ${
                          theme === t
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "hover:opacity-80"
                        }`}
                        title={t}
                        onClick={() => setTheme(t)}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected theme: {theme}
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Section */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">
                    Enable notification sounds
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </h3>

              <div>
                <p className="font-medium text-foreground mb-2">
                  Interface Language
                </p>
                <div className="flex gap-2 flex-wrap">
                  {languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant={language === lang ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setLanguage(lang)}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy & Data Section */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Privacy & Data
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Auto-save Chats
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Automatically save chat history
                    </p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Show system notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={onClose} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
