import { View, Text, TextInput } from 'react-native'

import { styles } from '../styles/fieldStyles'
import { colors } from '../styles/theme'

export default function Field({ label, style, error, hint, ...inputProps }) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput 
                style={[styles.input, error ? styles.inputError : null]} 
                placeholderTextColor={colors.dim}
                {...inputProps} 
            />
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : hint ? (
                <Text style={styles.hintText}>{hint}</Text>
            ) : null}
        </View>
    )
}