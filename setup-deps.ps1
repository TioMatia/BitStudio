# Microservicios NestJS
$services = @("auth", "store", "inventory", "order", "gateway")

# Paquetes comunes para NestJS
$corePackages = @(
  "@nestjs/typeorm",
  "typeorm",
  "pg",
  "@nestjs/config",
  "class-validator",
  "class-transformer"
)

# Paquetes adicionales para gateway
$gatewayPackages = @(
  "@nestjs/axios"
)

# Paquetes para frontend (React + Vite + Redux)
$frontendPackages = @(
  "@reduxjs/toolkit",
  "react-redux",
  "axios"
)

Write-Host "Instalando dependencias en microservicios..."

foreach ($service in $services) {
  if (Test-Path $service) {
    Write-Host "`nInstalando dependencias en '$service'..."
    Set-Location $service

    # Verifica e instala cada paquete si falta
    foreach ($pkg in $corePackages) {
      if (-Not (Test-Path "node_modules/$pkg")) {
        Write-Host "Instalando $pkg"
        npm install $pkg
      } else {
        Write-Host "$pkg ya está instalado"
      }
    }

    # Paquetes extra para gateway
    if ($service -eq "gateway") {
      foreach ($pkg in $gatewayPackages) {
        if (-Not (Test-Path "node_modules/$pkg")) {
          Write-Host "Instalando $pkg"
          npm install $pkg
        } else {
          Write-Host "$pkg ya está instalado"
        }
      }
    }

    Set-Location ..
  } else {
    Write-Host " Carpeta '$service' no encontrada. Saltando..."
  }
}

# Frontend
if (Test-Path "frontend") {
  Write-Host "`nInstalando dependencias en 'frontend'..."
  Set-Location frontend

  foreach ($pkg in $frontendPackages) {
    if (-Not (Test-Path "node_modules/$pkg")) {
      Write-Host "Instalando $pkg"
      npm install $pkg
    } else {
      Write-Host "$pkg ya está instalado"
    }
  }

  Set-Location ..
} else {
  Write-Host " Carpeta 'frontend' no encontrada. Saltando..."
}

Write-Host "`nInstalación completa."
