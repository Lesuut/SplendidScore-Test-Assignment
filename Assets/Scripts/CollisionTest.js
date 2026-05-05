// @input Physics.ColliderComponent physicsBody

if (!script.physicsBody) {
    print("ОШИБКА: Закинь компонент Physics Body в поле скрипта в Инспекторе!");
} else {
    // Событие срабатывает, когда объекты начали пересекаться
    script.physicsBody.onOverlapEnter.add(function (event) {
        var otherObj = event.overlap.getSceneObject();
        print("--- БАМ! ---");
        print("Объект " + script.getSceneObject().name + " коснулся " + otherObj.name);
    });

    // Событие срабатывает, когда объекты разошлись
    script.physicsBody.onOverlapExit.add(function (event) {
        var otherObj = event.overlap.getSceneObject();
        print("--- РАЗОШЛИСЬ ---");
        print(otherObj.name + " больше не касается нас.");
    });
}