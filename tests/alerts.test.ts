import test from "node:test";
import assert from "node:assert/strict";

import {
  formatBatteryLevel,
  getAlertTypeLabel,
  getAlertPriorityWeight,
  getAlertStatusLabel,
  hasBatteryLevel,
  isActiveAlert,
  isDispatchedAlert,
  isFalseAlarmAlert,
  isInProgressAlert,
  isLowBatteryLevel,
  isPendingAlert,
  isResolvedAlert,
  normalizeAlertStatus,
  normalizeAlertType,
} from "../src/lib/alerts.ts";

test("alert helpers classify statuses correctly", () => {
  assert.equal(isPendingAlert("PENDENTE"), true);
  assert.equal(isPendingAlert("REPORTED"), true);
  assert.equal(isDispatchedAlert("ASSIGNED"), true);
  assert.equal(isInProgressAlert("EM_DESLOCAMENTO"), true);
  assert.equal(isActiveAlert("EM_ATENDIMENTO"), true);
  assert.equal(isActiveAlert("ACCEPTED"), true);
  assert.equal(isResolvedAlert("RESOLVED"), true);
  assert.equal(isFalseAlarmAlert("FALSE_ALARM"), true);
});

test("alert priority keeps pending before active and resolved", () => {
  assert.equal(getAlertPriorityWeight("PENDENTE"), 1);
  assert.equal(getAlertPriorityWeight("EM_ATENDIMENTO"), 2);
  assert.equal(getAlertPriorityWeight("RESOLVIDO"), 3);
});

test("alert labels normalize known statuses", () => {
  assert.equal(normalizeAlertStatus("NOVO"), "REPORTED");
  assert.equal(normalizeAlertStatus("ASSUMIDO"), "ACCEPTED");
  assert.equal(normalizeAlertStatus("ENCERRADO"), "RESOLVED");
  assert.equal(getAlertStatusLabel("PENDENTE"), "Aguardando despacho");
  assert.equal(getAlertStatusLabel("ASSIGNED"), "Guarnição acionada");
  assert.equal(getAlertStatusLabel("ALARME_FALSO"), "Falso alarme");
  assert.equal(getAlertStatusLabel("RESOLVIDO"), "Resolvido");
});

test("battery helpers preserve critical zero percent values", () => {
  assert.equal(hasBatteryLevel(0), true);
  assert.equal(isLowBatteryLevel(0), true);
  assert.equal(formatBatteryLevel(0), "0%");
  assert.equal(formatBatteryLevel(null), "Oculta");
});

test("alert types normalize aliases used across modules", () => {
  assert.equal(normalizeAlertType("SOS_AGUA"), "DROWNING");
  assert.equal(normalizeAlertType("CHILD_MISSING"), "LOST_CHILD");
  assert.equal(normalizeAlertType("EMERGENCIA_MEDICA"), "MEDICAL");
  assert.equal(getAlertTypeLabel("POSSIVEL_AFOGAMENTO"), "Afogamento");
  assert.equal(getAlertTypeLabel("CRIANCA_PERDIDA"), "Criança perdida");
});
