$tests = @(
  "unitarias/iteracion-1/passwordRules.test.js",
  "unitarias/iteracion-1/dateTime.test.js",
  "unitarias/iteracion-1/validateLoginFields.test.js",
  "unitarias/iteracion-2/timeOverlap.test.js",
  "unitarias/iteracion-2/actividades.test.js",
  "unitarias/iteracion-3/chatMessages.test.js",
  "unitarias/iteracion-3/ratingValidation.test.js",
  "unitarias/iteracion-4/snapshot.test.js",
  "unitarias/iteracion-4/buildChangesList.test.js",
  "unitarias/iteracion-4/notificaciones.test.js",
  "unitarias/iteracion-5/statusMapping.test.js",
  "unitarias/iteracion-5/groups.test.js",
  "unitarias/iteracion-6/activityTime.test.js",
  "unitarias/iteracion-6/reports.test.js"
)

foreach ($test in $tests) {
  Write-Host "`n`n========================================"
  Write-Host ">>> $test"
  Write-Host "========================================"
  npx vitest run $test --reporter=verbose --config vitest.config.mjs 2>&1
}
