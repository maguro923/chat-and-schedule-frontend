import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

export const pickImageAsync = async() => {
    // 画像をデバイス内から選択し256px×256pxにリサイズして返す
    let result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
        const manipResult = await manipulateAsync(result.assets[0].uri, [{resize:{width:256}}],{format: SaveFormat.PNG});
        return manipResult.uri;
    }else{
        return null;
    }
};
