String command = "OFF";

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\n');

    if (command == "ON") {
      digitalWrite(13, HIGH);
    }
    else if (command == "OFF") {
      digitalWrite(13, LOW);
    }
  }
}
